const mongoose = require('mongoose');
const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// ── Create ────────────────────────────────────────────────────────────────────

/**
 * POST /api/tasks
 * Create a new task owned by the authenticated user.
 */
const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate } = req.body;

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    dueDate,
    userId: req.userId,
  });

  res.status(201).json({ success: true, task });
});

// ── Read (list) ───────────────────────────────────────────────────────────────

/**
 * GET /api/tasks
 * Return a paginated, filtered, and sorted list of the authenticated user's tasks.
 *
 * Query params:
 *   status    – filter by task status
 *   priority  – filter by priority
 *   search    – full-text search on title (uses text index)
 *   page      – page number (default: 1)
 *   limit     – results per page (default: 10)
 *   sortBy    – 'dueDate' | 'priority' | 'createdAt' (default)
 *   order     – 'asc' | 'desc' (default: 'desc')
 */
const getTasks = asyncHandler(async (req, res) => {
  const {
    status,
    priority,
    search,
    sortBy,
    order = 'desc',
  } = req.query;

  // Parse and clamp pagination values
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limitNum;

  // Build the base filter (always scoped to the requesting user)
  const filter = { userId: new mongoose.Types.ObjectId(req.userId) };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (search) filter.$text = { $search: search };

  // ── Priority sort via aggregation pipeline ──────────────────────────────────
  if (sortBy === 'priority') {
    const sortDir = order === 'asc' ? 1 : -1;

    const pipeline = [
      { $match: filter },
      {
        $addFields: {
          // Map string priority to numeric weight for correct ordering
          priorityWeight: {
            $switch: {
              branches: [
                { case: { $eq: ['$priority', 'High'] }, then: 3 },
                { case: { $eq: ['$priority', 'Medium'] }, then: 2 },
                { case: { $eq: ['$priority', 'Low'] }, then: 1 },
              ],
              default: 0,
            },
          },
        },
      },
      { $sort: { priorityWeight: sortDir } },
      { $skip: skip },
      { $limit: limitNum },
      { $project: { priorityWeight: 0 } }, // Strip the temporary field from results
    ];

    const [tasks, totalCount] = await Promise.all([
      Task.aggregate(pipeline),
      Task.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      tasks,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
        currentPage: page,
        limit: limitNum,
      },
    });
  }

  // ── Regular find for all other sort fields ──────────────────────────────────
  const sortDirection = order === 'asc' ? 1 : -1;
  let sort;
  if (sortBy === 'dueDate') {
    sort = { dueDate: sortDirection };
  } else {
    // Default: newest first
    sort = { createdAt: -1 };
  }

  const [tasks, totalCount] = await Promise.all([
    Task.find(filter).sort(sort).skip(skip).limit(limitNum),
    Task.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    tasks,
    pagination: {
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: page,
      limit: limitNum,
    },
  });
});

// ── Read (single) ─────────────────────────────────────────────────────────────

/**
 * GET /api/tasks/:id
 * Return a single task owned by the authenticated user.
 */
const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    userId: req.userId,
  });

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  res.status(200).json({ success: true, task });
});

// ── Update ────────────────────────────────────────────────────────────────────

/**
 * PUT /api/tasks/:id
 * Update any fields of a task owned by the authenticated user.
 */
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  res.status(200).json({ success: true, task });
});

// ── Delete ────────────────────────────────────────────────────────────────────

/**
 * DELETE /api/tasks/:id
 * Permanently remove a task owned by the authenticated user.
 */
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId,
  });

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  res.status(200).json({ success: true, message: 'Task deleted' });
});

// ── Toggle complete ───────────────────────────────────────────────────────────

/**
 * PATCH /api/tasks/:id/complete
 * Toggle a task's status between 'Done' and 'Todo'.
 */
const completeTask = asyncHandler(async (req, res) => {
  // Fetch current status first so we know which direction to toggle
  const existing = await Task.findOne({
    _id: req.params.id,
    userId: req.userId,
  });

  if (!existing) {
    throw new ApiError(404, 'Task not found');
  }

  const newStatus = existing.status === 'Done' ? 'Todo' : 'Done';

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { status: newStatus },
    { new: true }
  );

  res.status(200).json({ success: true, task });
});

// ── Analytics ─────────────────────────────────────────────────────────────────

/**
 * GET /api/tasks/analytics
 * Return aggregated statistics for the authenticated user's tasks.
 *
 * Response shape:
 * {
 *   total, completed, pending, inProgress, completionPercentage
 * }
 */
const getAnalytics = asyncHandler(async (req, res) => {
  const result = await Task.aggregate([
    // Scope exclusively to the requesting user
    { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
    {
      $facet: {
        // Count tasks grouped by status
        statusCounts: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
        // Total document count
        total: [{ $count: 'count' }],
      },
    },
  ]);

  const data = result[0];
  const totalCount = data.total[0]?.count || 0;

  // Build a quick lookup map: { 'Done': 5, 'Todo': 3, 'In Progress': 2 }
  const statusMap = {};
  data.statusCounts.forEach((s) => {
    statusMap[s._id] = s.count;
  });

  const completed = statusMap['Done'] || 0;
  const inProgress = statusMap['In Progress'] || 0;
  const pending = statusMap['Todo'] || 0;
  const completionPercentage =
    totalCount > 0 ? Math.round((completed / totalCount) * 100) : 0;

  res.status(200).json({
    success: true,
    analytics: {
      total: totalCount,
      completed,
      pending,
      inProgress,
      completionPercentage,
    },
  });
});

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  completeTask,
  getAnalytics,
};
