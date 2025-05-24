import api from './api'; // Configured Axios instance

// --- User-facing order functions ---

/**
 * Places a new order by the authenticated user.
 * @param {object} shippingAddress - The shipping address object.
 * @returns {Promise<object>} The newly created order.
 */
export const placeOrder = async (shippingAddress) => {
  try {
    const response = await api.post('/orders', { shippingAddress });
    return response.data;
  } catch (error) {
    console.error('Error placing order:', error.response ? error.response.data : error.message);
    throw error.response?.data || new Error('Failed to place order.');
  }
};

/**
 * Fetches a specific order by its ID for the authenticated user.
 * @param {string|number} orderId - The ID of the order to fetch.
 * @returns {Promise<object>} The order object.
 */
export const getOrderById = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error.response ? error.response.data : error.message);
    throw error.response?.data || new Error('Failed to fetch order details.');
  }
};

/**
 * Fetches all orders for the current authenticated user.
 * @returns {Promise<Array<object>>} A list of the user's orders.
 */
export const listUserOrders = async () => {
  try {
    const response = await api.get('/orders');
    return response.data;
  } catch (error) {
    console.error('Error fetching user orders:', error.response ? error.response.data : error.message);
    throw error.response?.data || new Error('Failed to fetch user orders.');
  }
};

// --- Admin-facing order functions ---

/**
 * Fetches all orders for admin. (Admin protected)
 * Assumes an endpoint like /api/admin/orders or that /api/orders behaves differently for admins.
 * For now, let's assume a dedicated admin endpoint /api/admin/orders for clarity.
 * @returns {Promise<Array<object>>} A list of all orders.
 */
export const getAllOrdersForAdmin = async () => {
  try {
    // TODO: Adjust endpoint if backend uses a different one for admin fetching all orders (e.g., /api/admin/orders)
    // For now, assuming the backend /api/orders is role-aware or a new /api/admin/orders endpoint will be created.
    // If using the same user-facing endpoint, the backend must ensure admins get all orders.
    // Using a placeholder for now, will need to match actual backend endpoint for admin.
    const response = await api.get('/admin/orders'); // Placeholder - adjust to actual admin endpoint
    return response.data;
  } catch (error) {
    console.error('Error fetching all orders for admin:', error.response ? error.response.data : error.message);
    throw error.response?.data || new Error('Failed to fetch all orders.');
  }
};

/**
 * Fetches a specific order by its ID for admin. (Admin protected)
 * Assumes an endpoint like /api/admin/orders/:orderId or that /api/orders/:orderId is role-aware.
 * @param {string|number} orderId - The ID of the order to fetch.
 * @returns {Promise<object>} The order object.
 */
export const getOrderByAdmin = async (orderId) => {
  try {
    // TODO: Adjust endpoint if backend uses a different one for admin fetching specific order (e.g., /api/admin/orders/:orderId)
    const response = await api.get(`/admin/orders/${orderId}`); // Placeholder - adjust to actual admin endpoint
    return response.data;
  } catch (error) {
    console.error(`Error fetching order ${orderId} for admin:`, error.response ? error.response.data : error.message);
    throw error.response?.data || new Error('Failed to fetch order details for admin.');
  }
};

/**
 * Updates the status of an order. (Admin protected)
 * @param {string|number} orderId - The ID of the order to update.
 * @param {string} status - The new status for the order.
 * @returns {Promise<object>} The updated order.
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    // TODO: Adjust endpoint to the new backend endpoint for updating status (e.g., /api/admin/orders/:orderId/status)
    const response = await api.put(`/admin/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating status for order ${orderId}:`, error.response ? error.response.data : error.message);
    throw error.response?.data || new Error('Failed to update order status.');
  }
};
