const db = require('../database/db');
const cartService = require('./cart.service'); // To get cart and clear it

class OrderService {
  /**
   * Creates a new order for a user based on their current cart.
   * @param {object} orderData - Data for creating the order.
   * @param {number} orderData.userId - The ID of the user placing the order.
   * @param {object} orderData.shippingAddress - The shipping address for the order.
   * @returns {Promise<object>} The newly created order.
   */
  async createOrder({ userId, shippingAddress }) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const cart = await cartService.getCartByUserId(userId);
      if (!cart || !cart.items || cart.items.length === 0) {
        throw new Error('Cannot create order: Cart is empty.');
      }

      let totalAmount = 0;
      const productStockUpdates = [];

      for (const item of cart.items) {
        const productResult = await client.query('SELECT stock_quantity, price, name FROM products WHERE id = $1 FOR UPDATE', [item.productId]);
        if (productResult.rows.length === 0) {
          throw new Error(`Product with ID ${item.productId} not found.`);
        }
        const product = productResult.rows[0];
        if (product.stock_quantity < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}. Available: ${product.stock_quantity}, Requested: ${item.quantity}.`);
        }
        totalAmount += item.priceAtAddition * item.quantity;
        productStockUpdates.push({
          productId: item.productId,
          newStock: product.stock_quantity - item.quantity,
        });
      }
      totalAmount = parseFloat(totalAmount.toFixed(2));

      const orderQuery = `
        INSERT INTO orders (user_id, total_amount, shipping_address, status, payment_method, payment_status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      const orderParams = [userId, totalAmount, shippingAddress, 'pending', 'COD', 'unpaid'];
      const orderResult = await client.query(orderQuery, orderParams);
      const newOrder = orderResult.rows[0];

      const orderItemQuery = `
        INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
        VALUES ($1, $2, $3, $4);
      `;
      for (const item of cart.items) {
        await client.query(orderItemQuery, [newOrder.id, item.productId, item.quantity, item.priceAtAddition]);
      }

      const updateStockQuery = 'UPDATE products SET stock_quantity = $1 WHERE id = $2;';
      for (const update of productStockUpdates) {
        await client.query(updateStockQuery, [update.newStock, update.productId]);
      }

      if (cart.id) {
         await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);
      } else {
        const userCartForClear = await client.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
        if (userCartForClear.rows.length > 0) {
            await client.query('DELETE FROM cart_items WHERE cart_id = $1', [userCartForClear.rows[0].id]);
        }
      }

      await client.query('COMMIT');
      
      const itemsQuery = `
        SELECT oi.id, oi.product_id AS "productId", p.name AS "productName", oi.quantity, oi.price_at_purchase AS "priceAtPurchase"
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1;
      `;
      const itemsResult = await db.query(itemsQuery, [newOrder.id]);
      newOrder.items = itemsResult.rows;
      return newOrder;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating order:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Retrieves a specific order for a user, including its items.
   * @param {object} params - Parameters.
   * @param {number} params.orderId - The ID of the order.
   * @param {number} params.userId - The ID of the user who owns the order.
   * @returns {Promise<object|null>} The order object or null if not found/not owned by user.
   */
  async getOrderById({ orderId, userId }) {
    const orderQuery = `
      SELECT o.*, u.email as "userEmail" 
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = $1 AND o.user_id = $2;
    `;
    const orderResult = await db.query(orderQuery, [orderId, userId]);

    if (orderResult.rows.length === 0) {
      return null;
    }
    const order = orderResult.rows[0];

    const itemsQuery = `
      SELECT 
        oi.id AS "orderItemId", 
        oi.quantity, 
        oi.price_at_purchase AS "priceAtPurchase",
        p.id AS "productId", 
        p.name AS "productName", 
        p.description AS "productDescription"
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
      ORDER BY oi.created_at ASC;
    `;
    const itemsResult = await db.query(itemsQuery, [order.id]);
    order.items = itemsResult.rows;
    return order;
  }

  /**
   * Retrieves all orders for a specific user.
   * @param {object} params - Parameters.
   * @param {number} params.userId - The ID of the user.
   * @returns {Promise<Array<object>>} A list of orders, each with its items.
   */
  async listUserOrders({ userId }) {
    const ordersQuery = `
      SELECT o.*, u.email as "userEmail" 
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.user_id = $1 
      ORDER BY o.created_at DESC;
    `;
    const ordersResult = await db.query(ordersQuery, [userId]);
    const orders = ordersResult.rows;

    const itemsQuery = `
      SELECT 
        oi.id AS "orderItemId", 
        oi.quantity, 
        oi.price_at_purchase AS "priceAtPurchase",
        p.id AS "productId", 
        p.name AS "productName"
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
      ORDER BY oi.id ASC;
    `;
    for (const order of orders) {
      const itemsResult = await db.query(itemsQuery, [order.id]);
      order.items = itemsResult.rows;
    }
    return orders;
  }

  // --- Admin-specific functions ---

  /**
   * Fetches all orders for admin.
   * @returns {Promise<Array<object>>} A list of all orders with user and item details.
   */
  async getAllOrdersForAdmin() {
    const ordersQuery = `
      SELECT o.*, u.email as "userEmail" 
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC;
    `;
    const ordersResult = await db.query(ordersQuery);
    const orders = ordersResult.rows;

    const itemsQuery = `
      SELECT 
        oi.id AS "orderItemId", 
        oi.quantity, 
        oi.price_at_purchase AS "priceAtPurchase",
        p.id AS "productId", 
        p.name AS "productName"
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
      ORDER BY oi.id ASC;
    `;
    for (const order of orders) {
      const itemsResult = await db.query(itemsQuery, [order.id]);
      order.items = itemsResult.rows;
    }
    return orders;
  }

  /**
   * Fetches a specific order by its ID for admin (no user restriction).
   * @param {number} orderId - The ID of the order.
   * @returns {Promise<object|null>} The order object or null if not found.
   */
  async getOrderByIdForAdmin(orderId) {
    const orderQuery = `
      SELECT o.*, u.email as "userEmail" 
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = $1;
    `;
    const orderResult = await db.query(orderQuery, [orderId]);

    if (orderResult.rows.length === 0) {
      return null;
    }
    const order = orderResult.rows[0];

    const itemsQuery = `
      SELECT 
        oi.id AS "orderItemId", 
        oi.quantity, 
        oi.price_at_purchase AS "priceAtPurchase",
        p.id AS "productId", 
        p.name AS "productName", 
        p.description AS "productDescription"
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
      ORDER BY oi.created_at ASC;
    `;
    const itemsResult = await db.query(itemsQuery, [order.id]);
    order.items = itemsResult.rows;
    return order;
  }

  /**
   * Updates the status of an order by admin.
   * @param {number} orderId - The ID of the order to update.
   * @param {string} status - The new status.
   * @returns {Promise<object>} The updated order.
   */
  async updateOrderStatusByAdmin(orderId, status) {
    const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}. Allowed statuses are: ${allowedStatuses.join(', ')}.`);
    }

    const updateQuery = `
      UPDATE orders
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `;
    const result = await db.query(updateQuery, [status, orderId]);
    if (result.rows.length === 0) {
      throw new Error(`Order with ID ${orderId} not found.`);
    }
    
    // Fetch the updated order with user email and items to return consistent data
    return this.getOrderByIdForAdmin(orderId);
  }
}

module.exports = new OrderService();
