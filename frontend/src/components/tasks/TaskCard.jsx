import { useState } from 'react';
import { completeTask } from '../../api/taskApi';
import { useToast } from '../common/ToastContext';

const PRIORITY_DOT = { High: 'high', Medium: 'medium', Low: 'low' };
const STATUS_PILL  = { 'Todo': 'todo', 'In Progress': 'inprogress', 'Done': 'done' };

function CheckIcon() {
  return (
    <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1.5,5 4,7.5 8.5,2.5" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

export default function TaskCard({ task, onEdit, onDelete, onComplete }) {
  const { addToast } = useToast();
  const [completing, setCompleting] = useState(false);

  const handleComplete = async (e) => {
    e.stopPropagation();
    setCompleting(true);
    try {
      const res = await completeTask(task._id);
      onComplete(res.data.task);
      addToast(res.data.task.status === 'Done' ? 'Task completed' : 'Task reopened');
    } catch {
      addToast('Failed to update task', 'error');
    } finally {
      setCompleting(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return null;
    const date = new Date(d);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';
  const isDone = task.status === 'Done';

  return (
    <div className={`task-row${isDone ? ' task-done' : ''}`}>
      {/* Completion circle */}
      <button
        className={`task-check${isDone ? ' checked' : ''}`}
        onClick={handleComplete}
        disabled={completing}
        title={isDone ? 'Reopen task' : 'Mark complete'}
        aria-label={isDone ? 'Reopen task' : 'Mark complete'}
      >
        {(isDone || completing) && <CheckIcon />}
      </button>

      {/* Priority dot */}
      <div
        className={`priority-dot ${PRIORITY_DOT[task.priority] || 'low'}`}
        title={`${task.priority} priority`}
      />

      {/* Title + meta */}
      <div className="task-row-content">
        <span className="task-row-title" title={task.title}>{task.title}</span>
        <div className="task-row-meta">
          {task.dueDate && (
            <span className={`task-row-date${isOverdue ? ' overdue' : ''}`}>
              {formatDate(task.dueDate)}
            </span>
          )}
          <span className={`status-pill ${STATUS_PILL[task.status] || 'todo'}`}>
            {task.status}
          </span>
        </div>
      </div>

      {/* Hover actions */}
      <div className="task-row-actions">
        <button
          className="btn-icon"
          onClick={() => onEdit(task)}
          title="Edit task"
          aria-label="Edit task"
        >
          <EditIcon />
        </button>
        <button
          className="btn-icon"
          onClick={() => onDelete(task._id)}
          title="Delete task"
          aria-label="Delete task"
          style={{ color: 'var(--p-high)' }}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}
