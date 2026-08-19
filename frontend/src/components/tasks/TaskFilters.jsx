import { useRef } from 'react';

export default function TaskFilters({ filters, onChange }) {
  const debounceRef = useRef(null);

  const handleSearch = (e) => {
    const value = e.target.value;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onChange({ search: value, page: 1 }), 400);
  };

  const handleChange = (field) => (e) => onChange({ [field]: e.target.value, page: 1 });

  return (
    <div className="filters">
      <input
        type="search"
        placeholder="Search tasks..."
        defaultValue={filters.search}
        onChange={handleSearch}
        className="filter-search"
      />
      <select
        value={filters.status || ''}
        onChange={handleChange('status')}
        className="filter-select"
      >
        <option value="">All Statuses</option>
        <option>Todo</option>
        <option>In Progress</option>
        <option>Done</option>
      </select>
      <select
        value={filters.priority || ''}
        onChange={handleChange('priority')}
        className="filter-select"
      >
        <option value="">All Priorities</option>
        <option>High</option>
        <option>Medium</option>
        <option>Low</option>
      </select>
      <select
        value={filters.sortBy || ''}
        onChange={handleChange('sortBy')}
        className="filter-select"
      >
        <option value="">Sort by</option>
        <option value="dueDate">Due Date</option>
        <option value="priority">Priority</option>
      </select>
      <select
        value={filters.order || 'desc'}
        onChange={handleChange('order')}
        className="filter-select"
      >
        <option value="desc">Desc</option>
        <option value="asc">Asc</option>
      </select>
    </div>
  );
}
