import { useToast } from '../common/ToastContext';
import { completeTask } from '../../api/taskApi';

const PRIORITY_COLORS = {
  High: 'priority-high',
  Medium: 'priority-medium',
  Low: 'priority-low',
};
const STATUS_COLORS = {
  'Todo': 'status-todo',
  'In Progress': 'status-inprogress',
  'Done': 'status-done',
};

export default function TaskCard({ task, onEdit, onDelete, onComplete }) {
  const { addToast } = useToast();

  const handleComplete = async () => {
    try {
      const res = await completeTask(task._id);
      onComplete(res.data.task);
      addToast(res.data.task.status === 'Done' ? 'Task marked complete!' : 'Task reopened');
    } catch {
      addToast('Failed to update task', 'error');
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : 'No due date';
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== 'Done';

  return (
    <div className={`task-card ${task.status === 'Done' ? 'task-done' : ''} ${PRIORITY_COLORS[task.priority] || ''}`}>
      <div className="task-card-header">
        <span className={`badge ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
        <span className={`badge ${STATUS_COLORS[task.status]}`}>{task.status}</span>
      </div>
      <h3 className="task-title">{task.title}</h3>
      {task.description && <p className="task-desc">{task.description}</p>}
      <div className={`task-due ${isOverdue ? 'overdue' : ''}`}>
        📅 {formatDate(task.dueDate)}
        {isOverdue && <span className="overdue-badge">Overdue</span>}
      </div>
      <div className="task-actions">
        <button
          className={`btn btn-sm ${task.status === 'Done' ? 'btn-secondary' : 'btn-success'}`}
          onClick={handleComplete}
        >
          {task.status === 'Done' ? 'Reopen' : '✓ Complete'}
        </button>
        <button className="btn btn-sm btn-secondary" onClick={() => onEdit(task)}>
          Edit
        </button>
        <button className="btn btn-sm btn-danger" onClick={() => onDelete(task._id)}>
          Delete
        </button>
      </div>
    </div>
  );
}
