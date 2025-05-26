const { Pool } = require('pg');
const dbConfig = require('../config/db.config');

// Create a new connection pool
const pool = new Pool(dbConfig); // Uncommented

// Function to test the database connection
const testConnection = async () => {
  try {
    const client = await pool.connect(); // Use client for connection test
    console.log('Database connection configuration used by pool:', {
      host: pool.options?.host || dbConfig.connectionString?.substring(0, dbConfig.connectionString.indexOf('@')), // Simplified view for connection string
      port: pool.options?.port,
      user: pool.options?.user,
      database: pool.options?.database,
      ssl: pool.options?.ssl, // Log SSL configuration
      // Password is intentionally omitted for security
    });
    console.log('Attempting to connect to the PostgreSQL database...');
    await client.query('SELECT NOW()'); // Simple query to test connection
    console.log('Successfully connected to the PostgreSQL database.');
    client.release(); // Release the client back to the pool
    return true;
  } catch (error) {
    console.error('Failed to connect to the PostgreSQL database.');
    console.error('Error details:', {
      message: error.message,
      // stack: error.stack, // Stack can be very long, optionally enable if needed
      code: error.code,
    });
    // Log relevant parts of dbConfig without exposing sensitive details if connectionString is used
    if (dbConfig.connectionString) {
        console.error('Using DATABASE_URL (details partially masked):', dbConfig.connectionString.replace(/\/\/(.*):(.*)@/, '//<user>:<password>@'));
        console.error('SSL config:', dbConfig.ssl);
    } else {
        console.error('Database connection configuration used (fallback):', {
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            database: dbConfig.database,
        });
    }
    // throw error; // Re-throw if DB connection is critical for app start and you want it to fail loudly
    return false; // Or return false to allow app to continue starting if DB is not critical at this point
  }
};

// Test the connection when the module is loaded
// testConnection(); // You might want to call this from your main app.js or a startup script

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool, // Export the pool itself if needed for transactions or direct pool operations
  testConnection, // Export the test function
};
