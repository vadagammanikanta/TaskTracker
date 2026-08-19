import { useState, useRef, useEffect } from 'react';
import { updateTask, completeTask } from '../../api/taskApi';
import { useToast } from '../common/ToastContext';

const PRIORITY_DOT = { High: 'high', Medium: 'medium', Low: 'low' };

const ALL_STATUSES = [
  { value: 'Todo',        label: 'Todo',        icon: '○', className: 'todo' },
  { value: 'In Progress', label: 'In Progress', icon: '◐', className: 'inprogress' },
  { value: 'Done',        label: 'Done',        icon: '✓', className: 'done' },
];

function CheckIcon() {
  return (
    <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1.5,5 4,7.5 8.5,2.5" />
    </svg>
  );
}

function InProgressIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm0 18A8 8 0 0 1 12 4v16Z" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
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
  const [updating, setUpdating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleToggleComplete = async (e) => {
    e.stopPropagation();
    setUpdating(true);
    try {
      const res = await completeTask(task._id);
      onComplete(res.data.task);
      addToast(res.data.task.status === 'Done' ? 'Task marked Done' : 'Task reopened');
    } catch {
      addToast('Failed to update task', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleSelectStatus = async (newStatus, e) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (newStatus === task.status) return;

    setUpdating(true);
    try {
      const res = await updateTask(task._id, { status: newStatus });
      onComplete(res.data.task);
      addToast(`Status changed to ${newStatus}`);
    } catch {
      addToast('Failed to update status', 'error');
    } finally {
      setUpdating(false);
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
  const isInProgress = task.status === 'In Progress';
  const currentStatusObj = ALL_STATUSES.find(s => s.value === task.status) || ALL_STATUSES[0];

  return (
    <div className={`task-row${isDone ? ' task-done' : ''}`}>
      {/* Quick Check / Progress icon button */}
      <button
        className={`task-check${isDone ? ' checked' : ''}${isInProgress ? ' in-progress' : ''}`}
        onClick={handleToggleComplete}
        disabled={updating}
        title={isDone ? 'Mark as Todo' : 'Mark as Done'}
        aria-label={task.status}
      >
        {isDone && <CheckIcon />}
        {isInProgress && <InProgressIcon />}
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

          {/* Interactive Status Selector Dropdown */}
          <div className="status-dropdown-wrapper" ref={menuRef}>
            <button
              type="button"
              className={`status-select-btn status-btn-${currentStatusObj.className}`}
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              disabled={updating}
              aria-haspopup="true"
              aria-expanded={menuOpen}
              title="Click to change status"
            >
              <span className="status-btn-icon">{currentStatusObj.icon}</span>
              <span className="status-btn-text">{task.status}</span>
              <span className="status-btn-chevron"><ChevronDownIcon /></span>
            </button>

            {menuOpen && (
              <div className="status-menu-popup" role="menu">
                {ALL_STATUSES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    className={`status-menu-item item-${s.className}${s.value === task.status ? ' selected' : ''}`}
                    onClick={(e) => handleSelectStatus(s.value, e)}
                    role="menuitem"
                  >
                    <span className="menu-item-icon">{s.icon}</span>
                    <span className="menu-item-text">{s.label}</span>
                    {s.value === task.status && <span className="menu-item-check">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
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
