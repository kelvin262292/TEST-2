const jwt = require('jsonwebtoken');
const db = require('../database/db'); // To fetch user details
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined for auth middleware. Set it in your .env file.");
  // Potentially exit or prevent app from starting if critical,
  // but middleware might be part of a larger system that can run without it.
}

/**
 * Middleware to protect routes.
 * Verifies JWT token from Authorization header.
 * Attaches user object to req.user if token is valid.
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      if (!JWT_SECRET) { // Double check, though service would have exited
        console.error('JWT_SECRET not available in protect middleware');
        return res.status(500).json({ message: 'Internal server error: JWT configuration missing.' });
      }
      
      const decoded = jwt.verify(token, JWT_SECRET);

      // Fetch user from DB to ensure they exist and have up-to-date info
      // You can choose to trust the decoded payload directly if performance is critical
      // and you accept the risk of using potentially stale role/user data.
      const { rows } = await db.query('SELECT id, name, email, roles FROM users WHERE id = $1', [decoded.id]);
      
      if (rows.length === 0) {
        return res.status(401).json({ message: 'Not authorized, user not found.' });
      }

      req.user = rows[0]; // Attach user object to request
      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Not authorized, token invalid.' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Not authorized, token expired.' });
      }
      return res.status(401).json({ message: 'Not authorized, token failed.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided.' });
  }
};

/**
 * Middleware factory for role-based authorization.
 * @param {Array<string>} rolesArray - Array of roles that are allowed to access the route.
 * @returns {function} Express middleware function.
 */
const authorize = (rolesArray) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles || !Array.isArray(req.user.roles)) {
      return res.status(403).json({ message: 'Forbidden: User roles not defined.' });
    }

    const hasRequiredRole = req.user.roles.some(role => rolesArray.includes(role));

    if (!hasRequiredRole) {
      return res.status(403).json({ 
        message: `Forbidden: User role '${req.user.roles.join(', ')}' is not authorized to access this route. Required roles: ${rolesArray.join(', ')}.` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
