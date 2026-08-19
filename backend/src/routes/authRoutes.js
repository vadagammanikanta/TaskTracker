const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');

const { signup, login, logout, getMe } = require('../controllers/authController');
const protect = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// ── Rate limiter ──────────────────────────────────────────────────────────────
// Applies only to signup and login to mitigate brute-force attacks.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute sliding window
  max: 100,                  // Generous limit to prevent false positives behind reverse proxies
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again in 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Validation chains ─────────────────────────────────────────────────────────

const signupValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 50 })
    .withMessage('Name cannot exceed 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Valid email required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// ── Routes ────────────────────────────────────────────────────────────────────

// Public routes (rate-limited)
router.post('/signup', authLimiter, signupValidation, validate, signup);
router.post('/login', authLimiter, loginValidation, validate, login);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
