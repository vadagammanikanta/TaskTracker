const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Sign a JWT for the given user ID.
 * @param {string} id - MongoDB ObjectId string
 * @returns {string} Signed JWT token
 */
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '1h',
  });

/**
 * Attach a 'token' httpOnly cookie to the response.
 * Cookie is valid for 1 hour (3 600 000 ms).
 * In production across domains (e.g. vercel.app -> onrender.com),
 * sameSite must be 'none' and secure must be true.
 * @param {import('express').Response} res
 * @param {string} token
 */
const attachCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 3_600_000, // 1 hour in milliseconds
  });
};

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/auth/signup
 * Create a new user account and return a session cookie.
 */
const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Guard against duplicate registrations before Mongoose unique-index fires,
  // so we can return a friendlier message.
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(400, 'Email already registered');
  }

  const user = await User.create({ name, email, password });

  const token = signToken(user._id);
  attachCookie(res, token);

  res.status(201).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

/**
 * POST /api/auth/login
 * Authenticate an existing user and return a session cookie.
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Explicitly select password (excluded by default via `select: false`)
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const token = signToken(user._id);
  attachCookie(res, token);

  res.status(200).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

/**
 * POST /api/auth/logout
 * Clear the session cookie to log the user out.
 */
const logout = asyncHandler(async (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', '', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    expires: new Date(0),
  });

  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

/**
 * GET /api/auth/me
 * Return the currently authenticated user's profile (no password).
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);

  res.status(200).json({ success: true, user });
});

module.exports = { signup, login, logout, getMe };
