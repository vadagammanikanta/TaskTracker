const ApiError = require('../utils/ApiError');

/**
 * Global Express error-handling middleware.
 * Normalises Mongoose errors, JWT errors, and custom ApiErrors
 * into a consistent JSON response shape.
 *
 * Must be registered LAST in the middleware chain (4-argument signature).
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose CastError – invalid ObjectId in route param
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Mongoose duplicate-key violation (e.g. unique email)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // Mongoose schema-level ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // JSON Web Token errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Expose stack trace only in development for easier debugging
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
