import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// Colors keyed to CSS vars — must be static values for Recharts
const LIGHT_COLORS = {
  todo:       { bg: '#F3F4F6', text: '#6B7280' },
  inprogress: { bg: '#FEF3C7', text: '#92400E' },
  done:       { bg: '#0D9488', text: '#FFFFFF' },
};

const STATUS_COLORS = {
  'Todo': '#9CA3AF',
  'In Progress': '#F59E0B',
  'Done': '#0D9488',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '0.5rem 0.875rem',
      boxShadow: 'var(--shadow-md)',
      fontSize: '0.8125rem',
      fontWeight: 600,
      color: 'var(--text)',
    }}>
      <span style={{ color: 'var(--text-secondary)', marginRight: '0.5rem' }}>{name}</span>
      {value}
    </div>
  );
};

const CustomLegend = ({ payload }) => (
  <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', marginTop: '1rem' }}>
    {payload.map((entry, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color }} />
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {entry.value}
        </span>
      </div>
    ))}
  </div>
);

export default function AnalyticsChart({ analytics }) {
  const data = [
    { name: 'Todo',        value: analytics.pending },
    { name: 'In Progress', value: analytics.inProgress },
    { name: 'Done',        value: analytics.completed },
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
        Create some tasks to see your breakdown.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%" cy="50%"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={3}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#9CA3AF'} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
