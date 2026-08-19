import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAnalytics } from '../api/taskApi';
import AnalyticsChart from '../components/analytics/AnalyticsChart';
import Spinner from '../components/common/Spinner';

// Radial progress ring component
function RadialProgress({ pct = 0, size = 130, stroke = 9 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = Math.min(pct / 100, 1) * circ;

  return (
    <div className="hero-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
          transform={`rotate(-90 ${size/2} ${size/2})`}
        />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div className="hero-progress-text">
        <span className="hero-pct">{pct}%</span>
        <span className="hero-pct-label">Done</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAnalytics()
      .then(res => setAnalytics(res.data.analytics))
      .catch(() => setError('Failed to load analytics. Check your connection.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page">
        <div className="skeleton skeleton-hero" />
        <div className="dashboard-chart-section">
          <div className="skeleton" style={{ height: 260 }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  if (!analytics || analytics.total === 0) {
    return (
      <div className="page">
        <div className="dashboard-empty">
          <div className="empty-state-icon">📋</div>
          <p className="empty-state-title">No tasks yet</p>
          <p className="empty-state-desc">Create your first task to start tracking progress.</p>
          <Link to="/tasks" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Create your first task →
          </Link>
        </div>
      </div>
    );
  }

  const { total, completed, pending, inProgress, completionPercentage } = analytics;

  return (
    <div className="page">
      {/* Hero metric */}
      <div className="dashboard-hero">
        <RadialProgress pct={completionPercentage} />
        <div className="hero-body">
          <div>
            <p className="hero-heading">Task Progress</p>
            <p className="hero-subheading">
              {completed} of {total} tasks completed
            </p>
          </div>
          <div className="stat-row">
            <div className="stat-item">
              <span className="stat-item-value">{total}</span>
              <span className="stat-item-label">Total</span>
            </div>
            <div className="stat-item">
              <span className="stat-item-value success">{completed}</span>
              <span className="stat-item-label">Done</span>
            </div>
            <div className="stat-item">
              <span className="stat-item-value warning">{inProgress}</span>
              <span className="stat-item-label">In Progress</span>
            </div>
            <div className="stat-item">
              <span className="stat-item-value">{pending}</span>
              <span className="stat-item-label">Todo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="dashboard-chart-section">
        <h2>Status Breakdown</h2>
        <AnalyticsChart analytics={analytics} />
      </div>
    </div>
  );
}
