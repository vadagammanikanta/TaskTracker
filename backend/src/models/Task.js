const mongoose = require('mongoose');

/**
 * Task schema.
 * Each task is owned by a single User (userId reference).
 * Compound indexes on userId+status and userId+dueDate improve
 * common query patterns; a text index on title enables full-text search.
 */
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['Todo', 'In Progress', 'Done'],
        message: 'Status must be Todo, In Progress, or Done',
      },
      default: 'Todo',
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: 'Priority must be Low, Medium, or High',
      },
      default: 'Medium',
    },
    dueDate: {
      type: Date,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Compound index: filter by owner + status (most common list query)
taskSchema.index({ userId: 1, status: 1 });
// Compound index: filter by owner + dueDate (calendar / due-date views)
taskSchema.index({ userId: 1, dueDate: 1 });
// Text index on title for full-text search support
taskSchema.index({ title: 'text' });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
