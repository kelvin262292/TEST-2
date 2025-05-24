const orderService = require('../services/order.service');

class OrderController {
  // --- User-facing controller methods ---
  async placeOrder(req, res, next) {
    try {
      const { shippingAddress } = req.body;
      if (!shippingAddress || typeof shippingAddress !== 'object' ||
          !shippingAddress.street || !shippingAddress.city || 
          !shippingAddress.postalCode || !shippingAddress.country) {
        return res.status(400).json({ message: 'Shipping address must include street, city, postalCode, and country.' });
      }
      const orderData = { userId: req.user.id, shippingAddress };
      const newOrder = await orderService.createOrder(orderData);
      res.status(201).json(newOrder);
    } catch (error) {
      if (error.message.includes('Cart is empty') || error.message.includes('Insufficient stock') || error.message.includes('Product with ID') ) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async getUserOrder(req, res, next) {
    try {
      const { orderId } = req.params;
      const parsedOrderId = parseInt(orderId, 10);
      if (isNaN(parsedOrderId) || parsedOrderId <= 0) {
        return res.status(400).json({ message: 'Valid Order ID is required.' });
      }
      const order = await orderService.getOrderById({
        orderId: parsedOrderId,
        userId: req.user.id,
      });
      if (!order) {
        return res.status(404).json({ message: 'Order not found or you do not have permission to view it.' });
      }
      res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  }

  async listOrders(req, res, next) {
    try {
      const orders = await orderService.listUserOrders({ userId: req.user.id });
      res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
  }

  // --- Admin-facing controller methods ---

  /**
   * Admin: List all orders.
   */
  async listAllOrdersAdmin(req, res, next) {
    try {
      const orders = await orderService.getAllOrdersForAdmin();
      res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Get details of a specific order.
   */
  async getOrderDetailsAdmin(req, res, next) {
    try {
      const { orderId } = req.params;
      const parsedOrderId = parseInt(orderId, 10);
      if (isNaN(parsedOrderId) || parsedOrderId <= 0) {
        return res.status(400).json({ message: 'Valid Order ID is required.' });
      }
      const order = await orderService.getOrderByIdForAdmin(parsedOrderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found.' });
      }
      res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Update status of an order.
   */
  async updateOrderStatusAdmin(req, res, next) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      const parsedOrderId = parseInt(orderId, 10);
      if (isNaN(parsedOrderId) || parsedOrderId <= 0) {
        return res.status(400).json({ message: 'Valid Order ID is required.' });
      }

      if (!status || typeof status !== 'string') {
        return res.status(400).json({ message: 'Status is required and must be a string.' });
      }
      
      // Validation of status value is done in the service layer, but can be duplicated here if desired.
      // const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      // if (!allowedStatuses.includes(status)) {
      //    return res.status(400).json({ message: `Invalid status. Allowed: ${allowedStatuses.join(', ')}` });
      // }

      const updatedOrder = await orderService.updateOrderStatusByAdmin(parsedOrderId, status);
      res.status(200).json(updatedOrder);
    } catch (error) {
      if (error.message.includes('Invalid status') || error.message.includes('Order with ID') ) {
        return res.status(400).json({ message: error.message });
      }
      if (error.message.includes('not found')) { // From service if update target not found
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }
}

module.exports = new OrderController();
