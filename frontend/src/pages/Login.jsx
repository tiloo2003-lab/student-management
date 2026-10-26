import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth';
import { errMsg } from '../api';

const DEMO = [
  ['Admin', 'admin1@school.test'],
  ['Teacher', 'gv001@school.test'],
  ['Student', 'sv0001@school.test'],
];

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const wanted = params.get('redirect');
  const target = wanted && wanted.startsWith('/') && !wanted.startsWith('//') ? wanted : '/admin';
  const [email, setEmail] = useState('admin1@school.test');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={target} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      nav(target);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <section className="login-hero">
        <h1>Student<br />Management System</h1>
        <p>Manage departments, classes, subjects, grades and attendance on one unified platform for administrators, teachers and students.</p>
        <ul>
          <li>Administrators: manage all academic data</li>
          <li>Teachers: enter grades and take attendance for course sections</li>
          <li>Students: view grades, schedules and attendance</li>
        </ul>
      </section>
      <section className="login-box">
        <div className="login-card">
          <h2>Sign in</h2>
          <p className="sub" style={{ marginBottom: 20 }}>Use the account issued by your school</p>
          {error && <div className="alert">{error}</div>}
          <form onSubmit={submit}>
            <label className="field"><span>Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            </label>
            <label className="field"><span>Password</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            <button className="btn primary" style={{ width: '100%', justifyContent: 'center', padding: 11 }} disabled={busy}>
              {busy ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <div className="demo">
            <div className="sub">Demo accounts (password: <b>password</b>)</div>
            <div className="row">
              {DEMO.map(([l, em]) => (
                <button key={em} type="button" className="btn sm" onClick={() => { setEmail(em); setPassword('password'); }}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
