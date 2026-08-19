import { useState, useEffect, useRef } from 'react';
import { createTask, updateTask } from '../../api/taskApi';
import { useToast } from '../common/ToastContext';
import Spinner from '../common/Spinner';

const STATUSES   = ['Todo', 'In Progress', 'Done'];
const PRIORITIES = ['Low', 'Medium', 'High'];

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function TaskForm({ task, onClose, onSave }) {
  const { addToast } = useToast();
  const titleRef = useRef(null);

  const [form, setForm] = useState({
    title:       '',
    description: '',
    status:      'Todo',
    priority:    'Medium',
    dueDate:     '',
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title:       task.title || '',
        description: task.description || '',
        status:      task.status || 'Todo',
        priority:    task.priority || 'Medium',
        dueDate:     task.dueDate ? task.dueDate.slice(0, 10) : '',
      });
    }
    // Auto-focus title input
    setTimeout(() => titleRef.current?.focus(), 60);
  }, [task]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    setError('');
    setLoading(true);
    try {
      const res = task
        ? await updateTask(task._id, form)
        : await createTask(form);
      addToast(task ? 'Task updated' : 'Task created');
      onSave(res.data.task);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="task-panel" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={task ? 'Edit task' : 'New task'}>
        {/* Header */}
        <div className="task-panel-header">
          <h2>{task ? 'Edit task' : 'New task'}</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close">
            <XIcon />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="task-panel-body">
            {error && <div className="alert alert-error">{error}</div>}

            {/* Title — prominent */}
            <input
              ref={titleRef}
              className="task-title-input"
              name="title"
              value={form.title}
              onChange={set('title')}
              placeholder="Task title…"
              maxLength={200}
              autoComplete="off"
            />

            {/* Description */}
            <div className="form-group">
              <label htmlFor="desc">Description</label>
              <textarea
                id="desc"
                name="description"
                value={form.description}
                onChange={set('description')}
                placeholder="Add more context…"
                rows={3}
                maxLength={1000}
              />
            </div>

            {/* Status + Priority + Due Date */}
            <div className="task-meta-row">
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select id="status" name="status" value={form.status} onChange={set('status')}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select id="priority" name="priority" value={form.priority} onChange={set('priority')}>
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="dueDate">Due date</label>
                <input
                  id="dueDate" type="date" name="dueDate"
                  value={form.dueDate} onChange={set('dueDate')}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="task-panel-footer">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Spinner size="sm" /> : (task ? 'Save changes' : 'Create task')}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
