import { Link, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useAuth } from '../auth';
import { useConfirmLeave } from '../UnsavedChanges';
import { roleLabel } from '../utils';

export default function AccountMenu() {
  const { user, logout } = useAuth();
  const confirmLeave = useConfirmLeave();
  const ref = useRef(null);
  const location = useLocation();
  useEffect(() => { if (ref.current) ref.current.open = false; }, [location]);
  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) ref.current.open = false; };
    const escape = (e) => { if (e.key === 'Escape' && ref.current) ref.current.open = false; };
    document.addEventListener('click', close); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('click', close); document.removeEventListener('keydown', escape); };
  }, []);
  return <details className="account-menu" ref={ref}>
    <summary><span className="avatar">{user.name?.trim()?.charAt(0) || 'U'}</span><span>{user.name}<small>{roleLabel[user.role]}</small></span></summary>
    <div className="account-dropdown">
      <Link to="/">News</Link><Link to="/workspace">Workspace</Link><Link to="/announcements">Your notifications</Link><Link to="/profile">My account</Link>
      <button type="button" onClick={async () => { if (await confirmLeave()) await logout(); }}>Log out</button>
    </div>
  </details>;
}
