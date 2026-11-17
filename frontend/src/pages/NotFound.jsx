import { Link } from 'react-router-dom';
export default function NotFound() {
  return <main className="pub-main"><div className="card"><h1>Page not found</h1><p>This link may be incorrect or the page may have moved.</p><Link className="btn primary" to="/">Back to News</Link> <Link className="btn" to="/workspace">Workspace</Link></div></main>;
}
