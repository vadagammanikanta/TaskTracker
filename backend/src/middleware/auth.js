const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * JWT authentication middleware.
 * Reads the token from the httpOnly cookie, verifies it, and
 * attaches the authenticated user's ID to req.userId.
 *
 * Throws ApiError(401) if the token is missing or invalid.
 */
const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    throw new ApiError(401, 'Not authenticated');
  }

  // jwt.verify throws JsonWebTokenError / TokenExpiredError on failure,
  // which the global error handler normalises automatically.
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.userId = decoded.id;

  next();
});

module.exports = protect;
