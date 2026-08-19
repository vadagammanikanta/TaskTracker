export default function Spinner({ size = 'md' }) {
  return (
    <div className={`spinner spinner-${size}`} role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );
}
