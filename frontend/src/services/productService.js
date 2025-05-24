import api from './api'; // Configured Axios instance

/**
 * Fetches all products from the backend API.
 * @returns {Promise<Array<object>>} A list of products.
 * @throws {Error} If the API request fails.
 */
export const getAllProducts = async () => {
  try {
    const response = await api.get('/products');
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error.response ? error.response.data : error.message);
    throw error.response?.data || new Error('Failed to fetch products. Please try again later.');
  }
};

/**
 * Fetches a single product by its ID from the backend API.
 * @param {string|number} productId - The ID of the product to fetch.
 * @returns {Promise<object>} The product object.
 * @throws {Error} If the API request fails or product is not found.
 */
export const getProductById = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product with ID ${productId}:`, error.response ? error.response.data : error.message);
    const errorData = error.response?.data;
    if (errorData && errorData.message) {
      throw new Error(errorData.message);
    }
    throw new Error('Failed to fetch product details. Please try again later.');
  }
};

/**
 * Creates a new product. (Admin protected)
 * @param {object} productData - The data for the new product.
 *   Expected structure: { name, description, price, stock_quantity, category_id }
 * @returns {Promise<object>} The newly created product.
 */
export const createProduct = async (productData) => {
  try {
    const response = await api.post('/products', productData); // Auth token handled by Axios interceptor/defaults
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error.response ? error.response.data : error.message);
    throw error.response?.data || new Error('Failed to create product.');
  }
};

/**
 * Updates an existing product. (Admin protected)
 * @param {string|number} productId - The ID of the product to update.
 * @param {object} productData - The data to update the product with.
 * @returns {Promise<object>} The updated product.
 */
export const updateProduct = async (productId, productData) => {
  try {
    const response = await api.put(`/products/${productId}`, productData);
    return response.data;
  } catch (error) {
    console.error(`Error updating product ${productId}:`, error.response ? error.response.data : error.message);
    throw error.response?.data || new Error('Failed to update product.');
  }
};

/**
 * Deletes a product. (Admin protected)
 * @param {string|number} productId - The ID of the product to delete.
 * @returns {Promise<object>} Response data from the server (e.g., success message).
 */
export const deleteProduct = async (productId) => {
  try {
    const response = await api.delete(`/products/${productId}`);
    return response.data; // Typically includes a success message or details of deletion
  } catch (error) {
    console.error(`Error deleting product ${productId}:`, error.response ? error.response.data : error.message);
    throw error.response?.data || new Error('Failed to delete product.');
  }
};
