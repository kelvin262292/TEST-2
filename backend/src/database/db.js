const { Pool } = require('pg');
const dbConfig = require('../config/db.config');

// Create a new connection pool
const pool = new Pool(dbConfig);

// Function to test the database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Database connection configuration:', {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database,
      // Password is intentionally omitted for security
    });
    console.log('Successfully connected to the PostgreSQL database.');
    const res = await client.query('SELECT NOW()');
    console.log('Current time from database:', res.rows[0].now);
    client.release(); // Release the client back to the pool
    return true;
  } catch (error) {
    console.error('Failed to connect to the PostgreSQL database.');
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      errno: error.errno,
      syscall: error.syscall,
      address: error.address,
      port: error.port,
    });
    console.error('Database connection configuration used:', {
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        database: dbConfig.database,
        // Password is intentionally omitted for security
    });
    // Do not re-throw the error here if you want the app to start even if DB is not ready
    // Or re-throw if DB connection is critical for app start
    // throw error; 
    return false;
  }
};

// Test the connection when the module is loaded
// testConnection(); // You might want to call this from your main app.js or a startup script

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool, // Export the pool itself if needed for transactions or direct pool operations
  testConnection, // Export the test function
};
