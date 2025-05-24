const cartService = require('../services/cart.service');

class CartController {
  async getCart(req, res, next) {
    try {
      const cart = await cartService.getCartByUserId(req.user.id);
      res.status(200).json(cart);
    } catch (error) {
      next(error);
    }
  }

  async addItem(req, res, next) {
    try {
      const { productId, quantity } = req.body;
      if (!productId || typeof productId !== 'number' || productId <= 0) {
        return res.status(400).json({ message: 'Valid Product ID is required.' });
      }
      if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
        return res.status(400).json({ message: 'Valid Quantity is required (must be a positive integer).' });
      }

      const cartData = {
        userId: req.user.id,
        productId,
        quantity,
      };
      const updatedCart = await cartService.addItemToCart(cartData);
      res.status(200).json(updatedCart); // 200 or 201 if item is newly created vs updated
    } catch (error) {
      if (error.message.includes('Not enough stock') || error.message.includes('Product not found')) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async updateItem(req, res, next) {
    try {
      const { itemId } = req.params;
      const { quantity } = req.body;

      const cartItemId = parseInt(itemId, 10);
      if (isNaN(cartItemId) || cartItemId <= 0) {
        return res.status(400).json({ message: 'Valid Cart Item ID is required in URL.'});
      }
      if (quantity === undefined || typeof quantity !== 'number' || quantity < 0) {
        return res.status(400).json({ message: 'Valid Quantity is required (must be a non-negative integer).' });
      }

      const cartData = {
        userId: req.user.id,
        cartItemId,
        quantity,
      };
      const updatedCart = await cartService.updateCartItemQuantity(cartData);
      res.status(200).json(updatedCart);
    } catch (error) {
       if (error.message.includes('Not enough stock') || error.message.includes('not found')) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async removeItem(req, res, next) {
    try {
      const { itemId } = req.params;
      const cartItemId = parseInt(itemId, 10);
       if (isNaN(cartItemId) || cartItemId <= 0) {
        return res.status(400).json({ message: 'Valid Cart Item ID is required in URL.'});
      }

      const cartData = {
        userId: req.user.id,
        cartItemId,
      };
      const updatedCart = await cartService.removeCartItem(cartData);
      res.status(200).json(updatedCart);
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }

  async emptyCart(req, res, next) {
    try {
      const cartData = { userId: req.user.id };
      const updatedCart = await cartService.clearCart(cartData);
      res.status(200).json(updatedCart);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CartController();
