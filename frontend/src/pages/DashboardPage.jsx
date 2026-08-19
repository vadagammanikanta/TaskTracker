import { useState, useEffect } from 'react';
import { getAnalytics } from '../api/taskApi';
import StatCard from '../components/analytics/StatCard';
import AnalyticsChart from '../components/analytics/AnalyticsChart';
import SkeletonCard from '../components/common/SkeletonCard';

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAnalytics()
      .then(res => setAnalytics(res.data.analytics))
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <h1 className="page-title">Dashboard</h1>
      {loading && (
        <div className="stat-cards">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      )}
      {error && <div className="alert alert-error">{error}</div>}
      {analytics && (
        <>
          <div className="stat-cards">
            <StatCard
              title="Total Tasks"
              value={analytics.total}
              color="#6366f1"
              icon="📋"
            />
            <StatCard
              title="Completed"
              value={analytics.completed}
              color="#10b981"
              icon="✅"
            />
            <StatCard
              title="In Progress"
              value={analytics.inProgress}
              color="#f59e0b"
              icon="⏳"
            />
            <StatCard
              title="Todo"
              value={analytics.pending}
              color="#ef4444"
              icon="📌"
            />
          </div>
          <div className="completion-bar-wrapper">
            <p className="completion-label">
              {analytics.completionPercentage}% Complete
            </p>
            <div className="completion-bar">
              <div
                className="completion-fill"
                style={{ width: `${analytics.completionPercentage}%` }}
              ></div>
            </div>
          </div>
          <AnalyticsChart analytics={analytics} />
        </>
      )}
    </div>
  );
}
