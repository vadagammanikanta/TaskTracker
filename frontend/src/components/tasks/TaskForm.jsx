import { useState, useEffect } from 'react';
import { createTask, updateTask } from '../../api/taskApi';
import { useToast } from '../common/ToastContext';
import Spinner from '../common/Spinner';

export default function TaskForm({ task, onClose, onSave }) {
  const { addToast } = useToast();
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'Todo',
    priority: 'Medium',
    dueDate: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'Todo',
        priority: task.priority || 'Medium',
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      });
    }
  }, [task]);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    setError('');
    setLoading(true);
    try {
      let res;
      if (task) {
        res = await updateTask(task._id, form);
        addToast('Task updated!');
      } else {
        res = await createTask(form);
        addToast('Task created!');
      }
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
      <div className="modal modal-large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? 'Edit Task' : 'New Task'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label>Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Task title"
              maxLength={200}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Optional description"
              rows={3}
              maxLength={1000}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option>Todo</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
            />
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Spinner size="sm" /> : (task ? 'Update' : 'Create')}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
