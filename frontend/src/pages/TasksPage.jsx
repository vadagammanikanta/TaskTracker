import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getTasks, deleteTask } from '../api/taskApi';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm from '../components/tasks/TaskForm';
import TaskFilters from '../components/tasks/TaskFilters';
import ConfirmModal from '../components/common/ConfirmModal';
import Pagination from '../components/common/Pagination';
import { useToast } from '../components/common/ToastContext';

function TaskListSkeleton({ count = 6 }) {
  return (
    <div className="task-list">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton skeleton-row" />
      ))}
    </div>
  );
}

export default function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks,      setTasks]      = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [editTask,   setEditTask]   = useState(null);
  const [deleteId,   setDeleteId]   = useState(null);
  const { addToast } = useToast();

  const getFilters = useCallback(() => ({
    status:   searchParams.get('status')   || '',
    priority: searchParams.get('priority') || '',
    search:   searchParams.get('search')   || '',
    sortBy:   searchParams.get('sortBy')   || '',
    order:    searchParams.get('order')    || 'desc',
    page:     parseInt(searchParams.get('page') || '1'),
    limit:    12,
  }), [searchParams]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const filters = getFilters();
      const params  = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '' && v !== 0)
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
    const current   = Object.fromEntries(searchParams.entries());
    const newParams = { ...current, ...updates };
    Object.keys(newParams).forEach(k => {
      if (newParams[k] === '' || newParams[k] === undefined) delete newParams[k];
    });
    setSearchParams(newParams);
  };

  const handleSave = (task) => {
    setTasks(prev => {
      const idx = prev.findIndex(t => t._id === task._id);
      if (idx >= 0) { const n = [...prev]; n[idx] = task; return n; }
      return [task, ...prev];
    });
  };

  const handleDelete = async () => {
    try {
      await deleteTask(deleteId);
      setTasks(prev => prev.filter(t => t._id !== deleteId));
      addToast('Task deleted');
    } catch {
      addToast('Failed to delete', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const handleComplete = (updated) => {
    setTasks(prev => prev.map(t => t._id === updated._id ? updated : t));
  };

  const openCreate = () => { setEditTask(null); setShowForm(true); };
  const filters = getFilters();

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">My Tasks</h1>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>
          + New task
        </button>
      </div>

      {/* Filters */}
      <TaskFilters filters={filters} onChange={updateFilters} />

      {/* Count */}
      <p className="result-count">
        {pagination.totalCount} {pagination.totalCount === 1 ? 'task' : 'tasks'}
      </p>

      {/* Task list or skeleton or empty */}
      {loading ? (
        <TaskListSkeleton />
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✓</div>
          <p className="empty-state-title">
            {filters.search || filters.status || filters.priority
              ? 'No tasks match your filters'
              : 'No tasks yet'}
          </p>
          <p className="empty-state-desc">
            {filters.search || filters.status || filters.priority
              ? 'Try adjusting or clearing your filters.'
              : 'Get started by creating your first task.'}
          </p>
          {!filters.search && !filters.status && !filters.priority && (
            <button className="btn btn-primary btn-sm" onClick={openCreate} style={{ marginTop: '0.5rem' }}>
              Create your first task →
            </button>
          )}
        </div>
      ) : (
        <div className="task-list">
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

      {/* Pagination */}
      <Pagination
        currentPage={filters.page}
        totalPages={pagination.totalPages}
        onPageChange={(p) => updateFilters({ page: p })}
      />

      {/* Task form panel */}
      {showForm && (
        <TaskForm
          task={editTask}
          onClose={() => { setShowForm(false); setEditTask(null); }}
          onSave={handleSave}
        />
      )}

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={!!deleteId}
        message="This task will be permanently deleted and cannot be recovered."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
