/**
 * Custom operational error class for the API.
 * Extends the native Error with an HTTP statusCode and
 * a human-readable status string ('fail' | 'error').
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (4xx or 5xx)
   * @param {string} message    - Human-readable error message
   */
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
