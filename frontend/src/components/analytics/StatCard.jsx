export default function StatCard({ title, value, color, icon }) {
  return (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <p className="stat-label">{title}</p>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );
}
