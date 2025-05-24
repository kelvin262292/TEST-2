require('dotenv').config(); // To load .env file for environment variables

module.exports = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432, // Ensure port is an integer
  user: process.env.DB_USER || 'ecommerce_user',
  password: process.env.DB_PASSWORD || 'your_db_password',
  database: process.env.DB_NAME || 'ecommerce_db',
  // Add any other pg options here, like SSL
  // ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};
