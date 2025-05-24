const productService = require('../services/product.service');

/**
 * Controller for product-related operations.
 */
class ProductController {
  /**
   * Creates a new product.
   */
  async createProduct(req, res, next) {
    try {
      const { name, description, price, stock_quantity, category_id } = req.body;

      // Basic Input Validation
      if (name === undefined || price === undefined) {
        return res.status(400).json({ message: 'Name and price are required.' });
      }
      if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ message: 'Name must be a non-empty string.' });
      }
      if (typeof price !== 'number' || price <= 0) {
        return res.status(400).json({ message: 'Price must be a positive number.' });
      }
      if (stock_quantity !== undefined && (typeof stock_quantity !== 'number' || stock_quantity < 0)) {
        return res.status(400).json({ message: 'Stock quantity must be a non-negative number.' });
      }
      if (category_id !== undefined && (typeof category_id !== 'number' || category_id <= 0)) {
          return res.status(400).json({ message: 'Category ID must be a positive integer.' });
      }
      if (description !== undefined && typeof description !== 'string') {
        return res.status(400).json({ message: 'Description must be a string.' });
      }

      const productData = { name, description, price, stock_quantity, category_id };
      const newProduct = await productService.addProduct(productData);
      res.status(201).json(newProduct);
    } catch (error) {
      next(error); // Pass error to the centralized error handler
    }
  }

  /**
   * Retrieves all products.
   */
  async getAllProducts(req, res, next) {
    try {
      const products = await productService.findAllProducts();
      res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves a single product by its ID.
   */
  async getProductById(req, res, next) {
    try {
      const { id } = req.params;
      const productId = parseInt(id, 10);
      if (isNaN(productId) || productId <= 0) {
          return res.status(400).json({ message: 'Product ID must be a positive integer.' });
      }

      const product = await productService.findProductById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
      }
      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Updates an existing product.
   */
  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const productId = parseInt(id, 10);
      if (isNaN(productId) || productId <= 0) {
          return res.status(400).json({ message: 'Product ID must be a positive integer.' });
      }

      const updateData = req.body;

      // Basic Input Validation for update
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'No update data provided.' });
      }
      if (updateData.name !== undefined && (typeof updateData.name !== 'string' || updateData.name.trim() === '')) {
        return res.status(400).json({ message: 'Name must be a non-empty string.' });
      }
      if (updateData.price !== undefined && (typeof updateData.price !== 'number' || updateData.price <= 0)) {
        return res.status(400).json({ message: 'Price must be a positive number.' });
      }
      if (updateData.stock_quantity !== undefined && (typeof updateData.stock_quantity !== 'number' || updateData.stock_quantity < 0)) {
        return res.status(400).json({ message: 'Stock quantity must be a non-negative number.' });
      }
      if (updateData.category_id !== undefined && (updateData.category_id !== null && (typeof updateData.category_id !== 'number' || updateData.category_id <= 0))) {
          return res.status(400).json({ message: 'Category ID must be a positive integer or null.' });
      }
      if (updateData.description !== undefined && typeof updateData.description !== 'string') {
        return res.status(400).json({ message: 'Description must be a string.' });
      }

      const updatedProduct = await productService.modifyProduct(productId, updateData);
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found or no changes made.' });
      }
      res.status(200).json(updatedProduct);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deletes a product by its ID.
   */
  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      const productId = parseInt(id, 10);
      if (isNaN(productId) || productId <= 0) {
          return res.status(400).json({ message: 'Product ID must be a positive integer.' });
      }

      const result = await productService.removeProduct(productId);
      if (!result.deleted) {
        return res.status(404).json({ message: 'Product not found.' });
      }
      res.status(200).json({ message: 'Product deleted successfully.', rowCount: result.rowCount });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
