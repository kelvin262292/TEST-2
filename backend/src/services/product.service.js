const db = require('../database/db');

/**
 * Service layer for product-related operations.
 */
class ProductService {
  /**
   * Adds a new product to the database.
   * @param {object} productData - The data for the new product.
   * @param {string} productData.name - The name of the product.
   * @param {string} [productData.description] - The description of the product.
   * @param {number} productData.price - The price of the product.
   * @param {number} [productData.stock_quantity=0] - The stock quantity.
   * @param {number} [productData.category_id] - The ID of the category this product belongs to.
   * @returns {Promise<object>} The newly created product.
   */
  async addProduct(productData) {
    const { name, description, price, stock_quantity = 0, category_id } = productData;
    const query = `
      INSERT INTO products (name, description, price, stock_quantity, category_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const params = [name, description, price, stock_quantity, category_id];
    try {
      const { rows } = await db.query(query, params);
      return rows[0];
    } catch (error) {
      console.error('Error adding product to database:', error);
      throw error;
    }
  }

  /**
   * Fetches all products from the database.
   * @returns {Promise<Array<object>>} A list of all products.
   */
  async findAllProducts() {
    const query = `
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC;
    `;
    try {
      const { rows } = await db.query(query);
      return rows;
    } catch (error) {
      console.error('Error fetching all products from database:', error);
      throw error;
    }
  }

  /**
   * Fetches a single product by its ID.
   * @param {number} id - The ID of the product to fetch.
   * @returns {Promise<object|null>} The product if found, otherwise null.
   */
  async findProductById(id) {
    const query = `
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1;
    `;
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0] || null;
    } catch (error) {
      console.error(`Error fetching product with ID ${id} from database:`, error);
      throw error;
    }
  }

  /**
   * Updates an existing product in the database.
   * @param {number} id - The ID of the product to update.
   * @param {object} updateData - An object containing the fields to update.
   * @returns {Promise<object|null>} The updated product, or null if not found.
   */
  async modifyProduct(id, updateData) {
    const { name, description, price, stock_quantity, category_id } = updateData;
    // Build the query dynamically based on the fields provided
    const setClauses = [];
    const params = [];
    let paramIndex = 1;

    if (name !== undefined) {
      setClauses.push(`name = $${paramIndex++}`);
      params.push(name);
    }
    if (description !== undefined) {
      setClauses.push(`description = $${paramIndex++}`);
      params.push(description);
    }
    if (price !== undefined) {
      setClauses.push(`price = $${paramIndex++}`);
      params.push(price);
    }
    if (stock_quantity !== undefined) {
      setClauses.push(`stock_quantity = $${paramIndex++}`);
      params.push(stock_quantity);
    }
    if (category_id !== undefined) { // Allows setting category_id to null
      setClauses.push(`category_id = $${paramIndex++}`);
      params.push(category_id);
    }
    
    if (setClauses.length === 0) {
      // If no fields to update are provided, maybe return current product or error
      return this.findProductById(id);
    }

    params.push(id); // For the WHERE clause

    const query = `
      UPDATE products
      SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *;
    `;

    try {
      const { rows } = await db.query(query, params);
      return rows[0] || null;
    } catch (error) {
      console.error(`Error updating product with ID ${id} in database:`, error);
      throw error;
    }
  }

  /**
   * Deletes a product from the database by its ID.
   * @param {number} id - The ID of the product to delete.
   * @returns {Promise<{deleted: boolean,rowCount: number}>} An object indicating if deletion was successful and row count.
   */
  async removeProduct(id) {
    const query = 'DELETE FROM products WHERE id = $1;';
    try {
      const result = await db.query(query, [id]);
      return { deleted: result.rowCount > 0, rowCount: result.rowCount };
    } catch (error) {
      console.error(`Error deleting product with ID ${id} from database:`, error);
      throw error;
    }
  }
}

module.exports = new ProductService();
