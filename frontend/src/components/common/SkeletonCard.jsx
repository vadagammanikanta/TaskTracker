// Skeleton for a single task row (Linear-style row layout)
export default function SkeletonCard() {
  return <div className="skeleton skeleton-row" />;
}

// Named export for a hero-section skeleton (dashboard)
export function SkeletonHero() {
  return <div className="skeleton skeleton-hero" />;
}

// Named export for compact stat row skeleton
export function SkeletonStatRow() {
  return (
    <div style={{ display: 'flex', gap: 0, border: '1px solid var(--border)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="skeleton skeleton-stat" style={{ borderRight: i < 4 ? '1px solid var(--border)' : 'none' }} />
      ))}
    </div>
  );
}
