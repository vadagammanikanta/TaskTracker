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
  let token = req.cookies.token;

  // Also check Authorization header: Bearer <token> (for cross-origin environments where 3rd-party cookies are blocked)
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

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
