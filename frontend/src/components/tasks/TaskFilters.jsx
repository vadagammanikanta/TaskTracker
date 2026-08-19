import { useRef } from 'react';

const STATUS_OPTIONS  = ['Todo', 'In Progress', 'Done'];
const PRIORITY_OPTIONS = ['High', 'Medium', 'Low'];
const SORT_OPTIONS = [
  { value: '',         label: 'Newest' },
  { value: 'dueDate',  label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
];

export default function TaskFilters({ filters, onChange }) {
  const debounceRef = useRef(null);

  const handleSearch = (e) => {
    const value = e.target.value;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onChange({ search: value, page: 1 }), 380);
  };

  const toggleFilter = (field, value) => {
    // Toggle off if same value, otherwise set new value
    onChange({ [field]: filters[field] === value ? '' : value, page: 1 });
  };

  const handleSort = (e) => {
    const [sortBy, order = 'desc'] = e.target.value.split(':');
    onChange({ sortBy, order });
  };

  const sortValue = filters.sortBy
    ? `${filters.sortBy}:${filters.order || 'desc'}`
    : '';

  return (
    <div className="filter-bar">
      {/* Search */}
      <input
        type="search"
        className="filter-search"
        placeholder="Search tasks…"
        defaultValue={filters.search}
        onChange={handleSearch}
        aria-label="Search tasks"
      />

      <div className="filter-divider" />

      {/* Status pills */}
      <div className="filter-group">
        <span className="filter-group-label">Status</span>
        {STATUS_OPTIONS.map(s => (
          <button
            key={s}
            className={`pill-btn${filters.status === s ? ' active' : ''}`}
            onClick={() => toggleFilter('status', s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="filter-divider" />

      {/* Priority pills */}
      <div className="filter-group">
        <span className="filter-group-label">Priority</span>
        {PRIORITY_OPTIONS.map(p => (
          <button
            key={p}
            className={`pill-btn${filters.priority === p ? ' active' : ''}`}
            onClick={() => toggleFilter('priority', p)}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="filter-divider" />

      {/* Sort */}
      <select
        className="sort-select"
        value={sortValue}
        onChange={handleSort}
        aria-label="Sort tasks"
      >
        {SORT_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
        <option value="dueDate:asc">Due Date ↑</option>
        <option value="dueDate:desc">Due Date ↓</option>
        <option value="priority:desc">Priority ↓</option>
        <option value="priority:asc">Priority ↑</option>
      </select>
    </div>
  );
}
