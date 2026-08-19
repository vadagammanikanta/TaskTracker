const express = require('express');
const { body } = require('express-validator');

const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  completeTask,
  getAnalytics,
} = require('../controllers/taskController');
const protect = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// All task routes require authentication
router.use(protect);

// ── Validation chains ─────────────────────────────────────────────────────────

const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('status')
    .optional()
    .isIn(['Todo', 'In Progress', 'Done'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Invalid priority'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format – use ISO 8601 (e.g. 2025-12-31)'),
];

// All fields optional on update – allows partial PATCH-style updates via PUT
const updateTaskValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('status')
    .optional()
    .isIn(['Todo', 'In Progress', 'Done'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Invalid priority'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format – use ISO 8601 (e.g. 2025-12-31)'),
];

// ── Routes ────────────────────────────────────────────────────────────────────
// IMPORTANT: /analytics MUST be declared before /:id routes so Express does
// not interpret the literal string "analytics" as an ObjectId parameter.

router.get('/analytics', getAnalytics);

router.route('/')
  .get(getTasks)
  .post(createTaskValidation, validate, createTask);

router.route('/:id')
  .get(getTask)
  .put(updateTaskValidation, validate, updateTask)
  .delete(deleteTask);

router.patch('/:id/complete', completeTask);

module.exports = router;
