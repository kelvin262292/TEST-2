require('dotenv').config(); // To load .env file for environment variables

const dbConfig = {};

if (process.env.DATABASE_URL) {
  dbConfig.connectionString = process.env.DATABASE_URL;
  // For cloud databases like Neon that use sslmode=require,
  // pg often needs ssl: { rejectUnauthorized: false }
  if (process.env.DATABASE_URL.includes('sslmode=require')) {
    dbConfig.ssl = { rejectUnauthorized: false };
  }
} else {
  console.warn(
    "DATABASE_URL not found in .env. Falling back to individual DB parameters (which might be empty/null if not set)."
  );
  dbConfig.host = process.env.DB_HOST || '';
  dbConfig.port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : null;
  dbConfig.user = process.env.DB_USER || '';
  dbConfig.password = process.env.DB_PASSWORD || '';
  dbConfig.database = process.env.DB_NAME || '';
  // Note: The previous version had process.env.DB_PORT || null.
  // parseInt should only be called if DB_PORT exists.
}

module.exports = dbConfig;
