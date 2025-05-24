import api from './api'; // Configured Axios instance

/**
 * Fetches the user's current cart.
 * @returns {Promise<object>} The user's cart.
 */
export const getCart = async () => {
  try {
    const response = await api.get('/cart');
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error.response ? error.response.data : error.message);
    throw error.response?.data || new Error('Failed to fetch cart.');
  }
};

/**
 * Adds an item to the user's cart.
 * @param {number} productId - The ID of the product to add.
 * @param {number} quantity - The quantity of the product.
 * @returns {Promise<object>} The updated cart.
 */
export const addItemToCart = async (productId, quantity) => {
  try {
    const response = await api.post('/cart/items', { productId, quantity });
    return response.data;
  } catch (error) {
    console.error('Error adding item to cart:', error.response ? error.response.data : error.message);
    throw error.response?.data || new Error('Failed to add item to cart.');
  }
};

/**
 * Updates the quantity of an item in the cart.
 * @param {number} itemId - The ID of the cart item to update.
 * @param {number} quantity - The new quantity.
 * @returns {Promise<object>} The updated cart.
 */
export const updateCartItem = async (itemId, quantity) => {
  try {
    const response = await api.put(`/cart/items/${itemId}`, { quantity });
    return response.data;
  } catch (error) {
    console.error('Error updating cart item:', error.response ? error.response.data : error.message);
    throw error.response?.data || new Error('Failed to update cart item.');
  }
};

/**
 * Removes an item from the cart.
 * @param {number} itemId - The ID of the cart item to remove.
 * @returns {Promise<object>} The updated cart.
 */
export const removeCartItem = async (itemId) => {
  try {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing cart item:', error.response ? error.response.data : error.message);
    throw error.response?.data || new Error('Failed to remove cart item.');
  }
};

/**
 * Clears all items from the user's cart.
 * @returns {Promise<object>} The emptied cart.
 */
export const clearCart = async () => {
  try {
    const response = await api.delete('/cart');
    return response.data;
  } catch (error) {
    console.error('Error clearing cart:', error.response ? error.response.data : error.message);
    throw error.response?.data || new Error('Failed to clear cart.');
  }
};
