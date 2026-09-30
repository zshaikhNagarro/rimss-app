import './Loader.css';

export function Loader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <span className="loader__spinner" />
      <span>{label}</span>
    </div>
  );
}
