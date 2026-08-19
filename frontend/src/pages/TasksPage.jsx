import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getTasks, deleteTask } from '../api/taskApi';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm from '../components/tasks/TaskForm';
import TaskFilters from '../components/tasks/TaskFilters';
import ConfirmModal from '../components/common/ConfirmModal';
import Pagination from '../components/common/Pagination';
import SkeletonCard from '../components/common/SkeletonCard';
import { useToast } from '../components/common/ToastContext';

export default function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const { addToast } = useToast();

  const getFilters = useCallback(() => ({
    status: searchParams.get('status') || '',
    priority: searchParams.get('priority') || '',
    search: searchParams.get('search') || '',
    sortBy: searchParams.get('sortBy') || '',
    order: searchParams.get('order') || 'desc',
    page: parseInt(searchParams.get('page') || '1'),
    limit: 9,
  }), [searchParams]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const filters = getFilters();
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '')
      );
      const res = await getTasks(params);
      setTasks(res.data.tasks);
      setPagination(res.data.pagination);
    } catch {
      addToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, [getFilters, addToast]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const updateFilters = (updates) => {
    const current = Object.fromEntries(searchParams.entries());
    const newParams = { ...current, ...updates };
    // Remove empty values
    Object.keys(newParams).forEach(k => {
      if (!newParams[k] && newParams[k] !== 0) delete newParams[k];
    });
    setSearchParams(newParams);
  };

  const handleSave = (task) => {
    setTasks(prev => {
      const idx = prev.findIndex(t => t._id === task._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = task;
        return next;
      }
      return [task, ...prev];
    });
  };

  const handleDelete = async () => {
    try {
      await deleteTask(deleteId);
      setTasks(prev => prev.filter(t => t._id !== deleteId));
      addToast('Task deleted');
    } catch {
      addToast('Failed to delete task', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const handleComplete = (updatedTask) => {
    setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
  };

  const filters = getFilters();

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">My Tasks</h1>
        <button
          className="btn btn-primary"
          onClick={() => { setEditTask(null); setShowForm(true); }}
        >
          + New Task
        </button>
      </div>

      <TaskFilters filters={filters} onChange={updateFilters} />

      <p className="result-count">
        {pagination.totalCount} task{pagination.totalCount !== 1 ? 's' : ''} found
      </p>

      {loading ? (
        <div className="task-grid">
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <p>
            No tasks found.{' '}
            <button
              className="btn-link"
              onClick={() => { setEditTask(null); setShowForm(true); }}
            >
              Create one
            </button>
          </p>
        </div>
      ) : (
        <div className="task-grid">
          {tasks.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={(t) => { setEditTask(t); setShowForm(true); }}
              onDelete={setDeleteId}
              onComplete={handleComplete}
            />
          ))}
        </div>
      )}

      <Pagination
        currentPage={filters.page}
        totalPages={pagination.totalPages}
        onPageChange={(p) => updateFilters({ page: p })}
      />

      {showForm && (
        <TaskForm
          task={editTask}
          onClose={() => { setShowForm(false); setEditTask(null); }}
          onSave={handleSave}
        />
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        message="Are you sure you want to delete this task?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
