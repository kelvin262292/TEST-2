const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'E-commerce API',
    version: '1.0.0',
    description:
      'API documentation for the E-commerce backend application. ' +
      'This API provides endpoints for managing products, categories, users, and authentication.',
    contact: {
      name: 'API Support',
      url: 'https://your-support-url.com', // Replace with actual support URL
      email: 'support@example.com', // Replace with actual support email
    },
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3001}/api`, // Adjust if your API base path is different
      description: 'Development server',
    },
    // You can add more server entries here (e.g., staging, production)
    // {
    //   url: 'https://staging-api.example.com/api',
    //   description: 'Staging server',
    // },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { // This name ('bearerAuth') is referenced in route JSDoc security tags
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT Bearer token in the format: Bearer <token>',
      },
    },
    schemas: {
      // User Schemas
      UserInput: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
          password: { type: 'string', format: 'password', example: 'password123', minLength: 6 },
          roles: { type: 'array', items: { type: 'string', enum: ['user', 'admin'] }, example: ['user'] }
        },
      },
      UserLogin: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
          password: { type: 'string', format: 'password', example: 'password123' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
          roles: { type: 'array', items: { type: 'string' }, example: ['user'] },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      // Product Schemas
      ProductInput: {
        type: 'object',
        required: ['name', 'price'],
        properties: {
          name: { type: 'string', example: 'Awesome T-Shirt' },
          description: { type: 'string', example: 'A very comfortable and stylish t-shirt.' },
          price: { type: 'number', format: 'float', example: 29.99 },
          stock_quantity: { type: 'integer', example: 100, default: 0 },
          category_id: { type: 'integer', nullable: true, example: 1 },
        },
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Awesome T-Shirt' },
          description: { type: 'string', example: 'A very comfortable and stylish t-shirt.' },
          price: { type: 'number', format: 'float', example: 29.99 },
          stock_quantity: { type: 'integer', example: 100 },
          category_id: { type: 'integer', nullable: true, example: 1 },
          category_name: { type: 'string', nullable: true, example: 'Apparel' }, // From join
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      // Generic Error Schemas
      ErrorResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Error message description.' },
          statusCode: { type: 'integer', example: 400 },
          status: { type: 'string', example: 'error' }
        }
      },
      NotFoundError: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Resource not found.'}
        }
      },
      UnauthorizedError: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Not authorized, token failed.'}
        }
      },
      ForbiddenError: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Forbidden: User role is not authorized.'}
        }
      },
      // Order Schemas
      ShippingAddressInput: {
        type: 'object',
        required: ['street', 'city', 'postalCode', 'country'],
        properties: {
          street: { type: 'string', example: '123 Main St' },
          city: { type: 'string', example: 'Anytown' },
          postalCode: { type: 'string', example: '12345' },
          country: { type: 'string', example: 'USA' },
          state: { type: 'string', example: 'CA', nullable: true },
          instructions: { type: 'string', example: 'Leave at front door', nullable: true }
        }
      },
      OrderCreationPayload: {
        type: 'object',
        required: ['shippingAddress'],
        properties: {
          shippingAddress: { $ref: '#/components/schemas/ShippingAddressInput' }
          // paymentMethod: { type: 'string', enum: ['COD', 'Stripe'], example: 'COD' } // Example if more methods
        }
      },
      OrderItemDetails: { // Renaming from OrderItem to match service layer's detail level
        type: 'object',
        properties: {
          orderItemId: { type: 'integer', example: 1 },
          productId: { type: 'integer', example: 101 },
          productName: { type: 'string', example: 'Awesome T-Shirt' },
          quantity: { type: 'integer', example: 2 },
          priceAtPurchase: { type: 'number', format: 'float', example: 19.99 }
        }
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          user_id: { type: 'integer', example: 123 },
          userEmail: { type: 'string', format: 'email', example: 'user@example.com', description: "Email of the user who placed the order (included in admin views)" },
          total_amount: { type: 'number', format: 'float', example: 45.98 },
          status: { type: 'string', example: 'pending', enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] },
          shipping_address: { $ref: '#/components/schemas/ShippingAddressInput' },
          payment_method: { type: 'string', example: 'COD' },
          payment_status: { type: 'string', example: 'unpaid', enum: ['unpaid', 'paid', 'refunded'] },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/OrderItemDetails' }
          }
        }
      },
      // Cart Schemas
      CartItemDetails: {
        type: 'object',
        properties: {
          cartItemId: { type: 'integer', example: 1 },
          quantity: { type: 'integer', example: 2 },
          priceAtAddition: { type: 'number', format: 'float', example: 19.99 },
          itemCreatedAt: { type: 'string', format: 'date-time' },
          itemUpdatedAt: { type: 'string', format: 'date-time' },
          productId: { type: 'integer', example: 101 },
          productName: { type: 'string', example: 'Awesome T-Shirt' },
          productDescription: { type: 'string', example: 'A very comfortable and stylish t-shirt.' },
          currentProductPrice: { type: 'number', format: 'float', example: 20.50 },
          productStockQuantity: { type: 'integer', example: 50 }
        }
      },
      Cart: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          user_id: { type: 'integer', example: 123 },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/CartItemDetails' }
          },
          totalPrice: { type: 'number', format: 'float', example: 39.98 },
          totalItems: { type: 'integer', example: 2 }
        }
      }
    },
  },
};
// Note: The 'apis' path in options was already updated in the previous subtask to include './src/services/*.js'.
// If JSDoc comments for schemas are in service files, this is correct.
// However, typically schemas are defined here or referenced from model files if models are used.
// For this project, defining them directly in swagger.config.js is clear.

const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ['./src/routes/*.js', './src/controllers/*.js', './src/services/*.js'], // Adjust if needed
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
