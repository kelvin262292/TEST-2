const express = require('express');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const productRoutes = require('./routes/product.routes'); // Import product routes
const authRoutes = require('./routes/auth.routes'); // Import auth routes
const cartRoutes = require('./routes/cart.routes'); // Import cart routes
const orderRoutes = require('./routes/order.routes'); // Import user-facing order routes
const adminOrderRoutes = require('./routes/adminOrder.routes'); // Import admin order routes
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger.config'); // Your Swagger config

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(logger);
app.use(express.json()); // Middleware to parse JSON bodies

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Backend API is running' });
});

// Mount product routes
app.use('/api/products', productRoutes);

// Mount auth routes
app.use('/api/auth', authRoutes);

// Mount cart routes
app.use('/api/cart', cartRoutes);

// Mount order routes
app.use('/api/orders', orderRoutes); // User-facing orders

// Mount admin-specific order routes
app.use('/api/admin/orders', adminOrderRoutes);

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error Handling Middleware - should be last
app.use(errorHandler);

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app; // Export for testing or if server is started elsewhere
