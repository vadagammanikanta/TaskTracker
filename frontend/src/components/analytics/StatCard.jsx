export default function StatCard({ title, value, color }) {
  return (
    <div className="stat-item">
      <span className="stat-item-value" style={color ? { color } : {}}>{value}</span>
      <span className="stat-item-label">{title}</span>
    </div>
  );
}
