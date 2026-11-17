export default function LoadError({ message, onRetry }) {
  return <div className="card load-error" role="alert">
    <h3>Unable to load this page</h3><p>{message || 'Please check your connection and try again.'}</p>
    <button type="button" className="btn primary" onClick={onRetry}>Try again</button>
  </div>;
}
