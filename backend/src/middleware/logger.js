/**
 * Simple logging middleware.
 * Logs the request method and URL for every incoming request to the console.
 */
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next(); // Pass control to the next middleware function
};

module.exports = logger;
