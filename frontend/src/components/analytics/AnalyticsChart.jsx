import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#6366f1', '#f59e0b', '#10b981'];

export default function AnalyticsChart({ analytics }) {
  const data = [
    { name: 'Todo', value: analytics.pending },
    { name: 'In Progress', value: analytics.inProgress },
    { name: 'Done', value: analytics.completed },
  ].filter(d => d.value > 0);

  if (data.length === 0) return <p className="no-data">No task data yet.</p>;

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={90}
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
