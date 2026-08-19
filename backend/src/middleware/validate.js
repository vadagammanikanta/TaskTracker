const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Express-validator result checker middleware.
 * Must be placed AFTER the validation chain middleware in a route.
 * Collects all validation errors and forwards a single ApiError(400) if any exist.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((e) => e.msg)
      .join(', ');
    return next(new ApiError(400, message));
  }
  next();
};

module.exports = validate;
