import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from './api';
import { useLocation } from 'react-router-dom';
import { checkSession, clearSession, recordActivity, startSession } from './session';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const location = useLocation();
  const [logoutRequested, setLogoutRequested] = useState(false);
  useEffect(() => {
    if (location.pathname === '/login') setLogoutRequested(false);
  }, [location.pathname]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('token'));
  const [error, setError] = useState('');
  const [sessionVersion, setSessionVersion] = useState(0);
  const retrySession = useCallback(() => setSessionVersion((v) => v + 1), []);

  useEffect(() => {
    const token = checkSession();
    if (!token) { setUser(null); setLoading(false); return; }
    const ctrl = new AbortController();
    setLoading(true);
    setError('');
    api.get('/me', { signal: ctrl.signal })
      .then((r) => { if (checkSession() === token && !ctrl.signal.aborted) setUser(r.data); })
      .catch((e) => {
        if (ctrl.signal.aborted || localStorage.getItem('token') !== token) return;
        if (e.response?.status === 401) { clearSession(token); setUser(null); }
        else setError('We could not verify your session. Check your connection and try again.');
      })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });
    return () => ctrl.abort();
  }, [sessionVersion]);

  useEffect(() => {
    const expired = () => { setUser(null); setError(''); setLoading(false); };
    const sync = (e) => {
      if (e.key === 'token' || e.key === null) {
        setUser(null);
        setError('');
        setLoading(!!checkSession());
        setSessionVersion((v) => v + 1);
      } else if (e.key === 'portal-session') checkSession();
    };
    const check = () => { checkSession(); };
    const events = ['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart'];
    window.addEventListener('session-expired', expired);
    window.addEventListener('storage', sync);
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', check);
    events.forEach((name) => window.addEventListener(name, recordActivity, { passive: true }));
    const timer = window.setInterval(check, 1000);
    return () => {
      window.removeEventListener('session-expired', expired);
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', check);
      events.forEach((name) => window.removeEventListener(name, recordActivity));
      window.clearInterval(timer);
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/login', { email, password });
    startSession(data.token);
    setLogoutRequested(false);
    setUser(data.user);
    setError('');
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    setLogoutRequested(true);
    const token = localStorage.getItem('token');
    try { await api.post('/logout'); } catch {}
    clearSession(token);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, error, retrySession, login, logout, logoutRequested }}>
      {children}
    </AuthContext.Provider>
  );
}
