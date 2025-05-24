const db = require('../database/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Ensure JWT_SECRET is loaded

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined. Set it in your .env file.");
  process.exit(1); // Stop the application if JWT_SECRET is not set
}

class AuthService {
  /**
   * Registers a new user.
   * @param {object} userData - The data for the new user.
   * @param {string} userData.name - The name of the user.
   * @param {string} userData.email - The email of the user.
   * @param {string} userData.password - The plain text password.
   * @param {Array<string>} [userData.roles=['user']] - User roles.
   * @returns {Promise<object>} The user object (without password) and a JWT token.
   */
  async register(userData) {
    const { name, email, password, roles = ['user'] } = userData;

    // Check if user already exists
    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      const error = new Error('User with this email already exists.');
      error.statusCode = 409; // Conflict
      throw error;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user to database
    const query = `
      INSERT INTO users (name, email, hashed_password, roles)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, roles, created_at, updated_at;
    `;
    const params = [name, email, hashedPassword, roles];
    
    try {
      const { rows } = await db.query(query, params);
      const newUser = rows[0];

      // Generate token for the new user (essentially logging them in)
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, roles: newUser.roles },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return {
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          roles: newUser.roles,
          createdAt: newUser.created_at,
          updatedAt: newUser.updated_at,
        },
      };
    } catch (error) {
      console.error('Error registering user:', error);
      throw error; // Re-throw to be caught by controller
    }
  }

  /**
   * Logs in an existing user.
   * @param {object} credentials - User login credentials.
   * @param {string} credentials.email - The user's email.
   * @param {string} credentials.password - The user's plain text password.
   * @returns {Promise<object>} An object containing the JWT and user details (without password).
   */
  async login(credentials) {
    const { email, password } = credentials;

    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) {
      throw new Error('User not found');
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.hashed_password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, roles: user.roles },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    };
  }
}

module.exports = new AuthService();
