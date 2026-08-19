import { useRef } from 'react';

const STATUS_OPTIONS = [
  { value: '',            label: 'All',         icon: null },
  { value: 'Todo',        label: 'Todo',        icon: '○' },
  { value: 'In Progress', label: 'In Progress', icon: '◐' },
  { value: 'Done',        label: 'Done',        icon: '✓' },
];

const PRIORITY_OPTIONS = [
  { value: '',       label: 'All',    color: null },
  { value: 'High',   label: 'High',   color: 'var(--p-high)' },
  { value: 'Medium', label: 'Medium', color: 'var(--p-medium)' },
  { value: 'Low',    label: 'Low',    color: 'var(--p-low)' },
];

const SORT_OPTIONS = [
  { value: '',               label: 'Sort: Newest First' },
  { value: 'dueDate:asc',    label: 'Sort: Due Date (Earliest)' },
  { value: 'dueDate:desc',   label: 'Sort: Due Date (Latest)' },
  { value: 'priority:desc',  label: 'Sort: Priority (High → Low)' },
  { value: 'priority:asc',   label: 'Sort: Priority (Low → High)' },
];

export default function TaskFilters({ filters, onChange }) {
  const debounceRef = useRef(null);

  const handleSearch = (e) => {
    const value = e.target.value;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onChange({ search: value, page: 1 }), 350);
  };

  const handleStatusChange = (val) => {
    onChange({ status: val, page: 1 });
  };

  const handlePriorityChange = (val) => {
    onChange({ priority: val, page: 1 });
  };

  const handleSort = (e) => {
    const [sortBy, order = 'desc'] = e.target.value.split(':');
    onChange({ sortBy, order });
  };

  const sortValue = filters.sortBy
    ? `${filters.sortBy}:${filters.order || 'desc'}`
    : '';

  const currentStatus = filters.status || '';
  const currentPriority = filters.priority || '';

  return (
    <div className="filter-container">
      {/* Top row: Search input + Sort selector */}
      <div className="filter-top-row">
        <div className="filter-search-wrapper">
          <input
            type="search"
            className="filter-search"
            placeholder="Search tasks by title…"
            defaultValue={filters.search}
            onChange={handleSearch}
            aria-label="Search tasks"
          />
        </div>

        <div className="filter-sort-wrapper">
          <select
            className="sort-select"
            value={sortValue}
            onChange={handleSort}
            aria-label="Sort tasks"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Button groups for Status & Priority */}
      <div className="filter-chip-row">
        {/* Status filter group */}
        <div className="filter-group">
          <span className="filter-group-label">Status:</span>
          <div className="filter-chip-group" role="group" aria-label="Filter by status">
            {STATUS_OPTIONS.map(s => {
              const isActive = currentStatus === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  className={`filter-btn-chip${isActive ? ' active' : ''}${s.value ? ` chip-${s.value.toLowerCase().replace(' ', '')}` : ''}`}
                  onClick={() => handleStatusChange(s.value)}
                  aria-pressed={isActive}
                >
                  {s.icon && <span className="chip-icon">{s.icon}</span>}
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="filter-divider-dot" />

        {/* Priority filter group */}
        <div className="filter-group">
          <span className="filter-group-label">Priority:</span>
          <div className="filter-chip-group" role="group" aria-label="Filter by priority">
            {PRIORITY_OPTIONS.map(p => {
              const isActive = currentPriority === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  className={`filter-btn-chip${isActive ? ' active' : ''}`}
                  onClick={() => handlePriorityChange(p.value)}
                  aria-pressed={isActive}
                >
                  {p.color && (
                    <span className="chip-dot" style={{ backgroundColor: p.color }} />
                  )}
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
