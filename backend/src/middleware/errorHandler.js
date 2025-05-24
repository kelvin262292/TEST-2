/**
 * Basic error handling middleware.
 * It catches errors and returns a JSON response with an appropriate
 * status code and error message.
 */
const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging

  const statusCode = err.statusCode || 500; // Default to 500 Internal Server Error
  const message = err.message || 'Something went wrong!';

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  });
};

module.exports = errorHandler;
