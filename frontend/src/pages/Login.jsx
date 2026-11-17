import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { articleRedirect } from '../loginRedirect';
import { Loading } from '../components/ui';
import { useAuth } from '../auth';
import { errMsg } from '../api';
import './Login.css';

import Icon from '../components/Icon';
import LoadError from '../components/LoadError';

const DEMO = [
  ['Admin', 'admin1@school.test'],
  ['Teacher', 'gv001@school.test'],
  ['Student', 'sv0001@school.test'],
];

export default function Login() {
  const { user, loading, login, error: sessionError, retrySession } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const target = articleRedirect(params.get('redirect'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (loading) return <Loading />;
  if (sessionError) return <LoadError message={sessionError} onRetry={retrySession} />;
  if (user) return <Navigate to={target} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      nav(target, { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="campus-login">
      <section className="campus-story">
        <a className="campus-brand" href="/login"><span className="campus-mark"><Icon name="school" /></span><span>Student Management<small>YOUR CONNECTED CAMPUS</small></span></a>
        <div className="campus-intro">
          <span className="campus-eyebrow"><span /> Learn. Connect. Grow.</span>
          <h1>A better day<br />starts with a<br /><em>connected campus.</em></h1>
          <p>From your first class to your next achievement.<br />Everything you need, in one place.</p>
        </div>
        <div className="campus-preview" aria-label="Illustration of the academic portal with sample content">
          <div className="preview-window">
            <div className="preview-top"><span className="preview-dots">● ● ●</span><span>Campus overview</span><span className="preview-sample">PREVIEW</span></div>
            <div className="preview-body">
              <div className="preview-greeting"><span>Your next chapter</span><Icon name="school" /></div>
              <p>A little progress, every day.</p>
              <div className="preview-week">{'MTWTF'.split('').map((day, i) => <span key={i} className={i === 2 ? 'active' : ''}>{day}<b>{12 + i}</b></span>)}</div>
              <div className="preview-class"><span className="preview-class-icon"><Icon name="calendar" /></span><div><b>Web development</b><small>09:00 – 10:30 · Room A201</small></div><span className="preview-class-dot" /></div>
              <div className="preview-class secondary"><span className="preview-class-icon"><Icon name="school" /></span><div><b>Database fundamentals</b><small>13:30 – 15:00 · Room B102</small></div></div>
            </div>
          </div>
          <div className="preview-float"><span>✦</span><div><b>Keep moving forward</b><small>Every lesson is a new possibility.</small></div></div>
        </div>
        <div className="campus-story-foot"><span>One campus. Endless possibilities.</span><span>EST. FOR YOUR FUTURE ↗</span></div>
      </section>
      <section className="campus-access">
        <div className="campus-form-card">
          <span className="campus-welcome-icon"><Icon name="school" width="30" height="30" /></span>
          <div className="campus-kicker">YOUR CAMPUS, ONE SIGN-IN AWAY</div>
          <h2>Welcome back<span>.</span></h2>
          <p className="campus-form-description">Sign in to catch up, stay connected,<br />and make the most of your day.</p>
          {error && <div className="alert" role="alert">{error}</div>}
          <form onSubmit={submit}>
            <label className="campus-label" htmlFor="login-email">Email address</label>
            <div className="campus-input"><Icon name="mail" /><input id="login-email" type="email" autoComplete="username" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <label className="campus-label" htmlFor="login-password">Password</label>
            <div className="campus-input"><Icon name="lock" /><input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required /><button className="campus-password-toggle" type="button" onClick={() => setShowPassword((show) => !show)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}><Icon name="eye" /></button></div>
            <button className="campus-submit" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}<Icon name="arrow" />
            </button>
          </form>
          <div className="campus-demo">
            <div className="campus-divider"><span>EXPLORE THE DEMO</span></div>
            <p>Choose a role to try its full features.</p>
            <div className="campus-roles">
              {DEMO.map(([label, address]) => (
                <button key={address} type="button" className={email === address ? 'selected' : ''} disabled={busy} aria-pressed={email === address} onClick={() => { setEmail(address); setPassword('password'); setError(''); }}><Icon name={label.toLowerCase()} /><span>{label}</span></button>
              ))}
            </div>
          </div>
        </div>
        <p className="campus-access-foot"><Icon name="lock" width="14" height="14" /> Student Management · Academic portal</p>
      </section>
    </div>
  );
}
