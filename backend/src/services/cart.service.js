const db = require('../database/db');

class CartService {
  /**
   * Retrieves or creates a cart for a user, including cart items and product details.
   * @param {number} userId - The ID of the user.
   * @returns {Promise<object>} The user's cart with items.
   */
  async getCartByUserId(userId) {
    let cart = await db.query('SELECT * FROM carts WHERE user_id = $1', [userId]);

    if (cart.rows.length === 0) {
      // Create a new cart if one doesn't exist for the user
      cart = await db.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING *', [userId]);
    }
    const userCart = cart.rows[0];

    // Fetch cart items with product details
    const itemsQuery = `
      SELECT 
        ci.id AS "cartItemId", 
        ci.quantity, 
        ci.price_at_addition AS "priceAtAddition",
        ci.created_at AS "itemCreatedAt",
        ci.updated_at AS "itemUpdatedAt",
        p.id AS "productId", 
        p.name AS "productName", 
        p.description AS "productDescription",
        p.price AS "currentProductPrice",
        p.stock_quantity AS "productStockQuantity"
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
      ORDER BY ci.created_at ASC;
    `;
    const itemsResult = await db.query(itemsQuery, [userCart.id]);
    
    userCart.items = itemsResult.rows;
    userCart.totalPrice = userCart.items.reduce((total, item) => {
        return total + (item.priceAtAddition * item.quantity);
    }, 0);
    userCart.totalItems = userCart.items.reduce((count, item) => {
        return count + item.quantity;
    }, 0);

    return userCart;
  }

  /**
   * Adds an item to the user's cart or updates its quantity if it already exists.
   * @param {object} itemData - Data for the item to add.
   * @param {number} itemData.userId - The user's ID.
   * @param {number} itemData.productId - The product's ID.
   * @param {number} itemData.quantity - The quantity to add.
   * @returns {Promise<object>} The updated cart.
   */
  async addItemToCart({ userId, productId, quantity }) {
    if (quantity <= 0) {
      throw new Error('Quantity must be a positive integer.');
    }

    const cartResult = await db.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
    let cartId;

    if (cartResult.rows.length > 0) {
      cartId = cartResult.rows[0].id;
    } else {
      // If no cart, create one
      const newCartResult = await db.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING id', [userId]);
      cartId = newCartResult.rows[0].id;
    }

    // Fetch product details (price and stock)
    const productResult = await db.query('SELECT price, stock_quantity FROM products WHERE id = $1', [productId]);
    if (productResult.rows.length === 0) {
      throw new Error('Product not found.');
    }
    const product = productResult.rows[0];
    const priceAtAddition = product.price;

    // Basic stock check (optional as per instructions, but good practice)
    if (product.stock_quantity < quantity) {
        // More nuanced stock check if item is already in cart:
        const existingItemResult = await db.query(
            'SELECT quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
            [cartId, productId]
        );
        const currentQuantityInCart = existingItemResult.rows.length > 0 ? existingItemResult.rows[0].quantity : 0;
        if (product.stock_quantity < currentQuantityInCart + quantity && existingItemResult.rows.length > 0) {
             throw new Error(`Not enough stock for ${product.name}. Available: ${product.stock_quantity}, In Cart: ${currentQuantityInCart}, Requested: ${quantity}.`);
        } else if (product.stock_quantity < quantity) {
             throw new Error(`Not enough stock for ${product.name}. Available: ${product.stock_quantity}, Requested: ${quantity}.`);
        }
    }


    // Check if item already exists in cart
    const existingItemResult = await db.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cartId, productId]
    );

    if (existingItemResult.rows.length > 0) {
      // Update quantity
      const existingItem = existingItemResult.rows[0];
      const newQuantity = existingItem.quantity + quantity;
      // Re-check stock for updated quantity
      if (product.stock_quantity < newQuantity) {
        throw new Error(`Not enough stock to update quantity for ${product.name}. Available: ${product.stock_quantity}, Requested total: ${newQuantity}.`);
      }
      await db.query(
        'UPDATE cart_items SET quantity = $1, price_at_addition = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
        [newQuantity, priceAtAddition, existingItem.id]
      );
    } else {
      // Add new item
      await db.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity, price_at_addition) VALUES ($1, $2, $3, $4)',
        [cartId, productId, quantity, priceAtAddition]
      );
    }

    return this.getCartByUserId(userId); // Return the updated cart
  }

  /**
   * Updates the quantity of an item in the user's cart.
   * If quantity is 0, removes the item.
   * @param {object} itemData - Data for the item update.
   * @param {number} itemData.userId - The user's ID.
   * @param {number} itemData.cartItemId - The ID of the cart item to update.
   * @param {number} itemData.quantity - The new quantity.
   * @returns {Promise<object>} The updated cart.
   */
  async updateCartItemQuantity({ userId, cartItemId, quantity }) {
    if (quantity < 0) {
      throw new Error('Quantity cannot be negative.');
    }

    const cartResult = await db.query(
        `SELECT c.id AS "cartId", ci.product_id AS "productId" 
         FROM carts c JOIN cart_items ci ON c.id = ci.cart_id 
         WHERE c.user_id = $1 AND ci.id = $2`,
        [userId, cartItemId]
    );

    if (cartResult.rows.length === 0) {
      throw new Error('Cart item not found or does not belong to the user.');
    }
    const { cartId, productId } = cartResult.rows[0];

    if (quantity === 0) {
      return this.removeCartItem({ userId, cartItemId }); // Use existing remove logic
    } else {
      // Check stock before updating
      const productResult = await db.query('SELECT stock_quantity, name FROM products WHERE id = $1', [productId]);
      if (productResult.rows.length === 0) throw new Error('Product associated with cart item not found.'); // Should not happen
      const product = productResult.rows[0];

      if (product.stock_quantity < quantity) {
        throw new Error(`Not enough stock for ${product.name}. Available: ${product.stock_quantity}, Requested: ${quantity}.`);
      }

      await db.query(
        'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [quantity, cartItemId]
      );
    }
    return this.getCartByUserId(userId);
  }

  /**
   * Removes an item from the user's cart.
   * @param {object} itemData - Data for item removal.
   * @param {number} itemData.userId - The user's ID.
   * @param {number} itemData.cartItemId - The ID of the cart item to remove.
   * @returns {Promise<object>} The updated cart.
   */
  async removeCartItem({ userId, cartItemId }) {
    const cartResult = await db.query(
      'SELECT c.id FROM carts c JOIN cart_items ci ON c.id = ci.cart_id WHERE c.user_id = $1 AND ci.id = $2',
      [userId, cartItemId]
    );

    if (cartResult.rows.length === 0) {
      throw new Error('Cart item not found or does not belong to the user.');
    }

    await db.query('DELETE FROM cart_items WHERE id = $1', [cartItemId]);
    return this.getCartByUserId(userId);
  }

  /**
   * Removes all items from a user's cart.
   * @param {number} userId - The ID of the user.
   * @returns {Promise<object>} The emptied cart.
   */
  async clearCart({ userId }) {
    const cartResult = await db.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
    if (cartResult.rows.length > 0) {
      const cartId = cartResult.rows[0].id;
      await db.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
    }
    // If no cart, getCartByUserId will create an empty one, which is fine.
    return this.getCartByUserId(userId);
  }
}

module.exports = new CartService();
