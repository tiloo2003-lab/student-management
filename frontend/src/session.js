export const IDLE_MS = 30 * 60 * 1000;
export const MAX_MS = 8 * 60 * 60 * 1000;
const KEY = 'portal-session';

export function readSession() {
  try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
}

export function isExpired(session, now = Date.now()) {
  return !session || !Number.isFinite(session.startedAt) || !Number.isFinite(session.activeAt)
    || now >= session.startedAt + MAX_MS || now >= session.activeAt + IDLE_MS;
}

export function startSession(token) {
  const now = Date.now();
  localStorage.setItem(KEY, JSON.stringify({ token, startedAt: now, activeAt: now }));
  localStorage.setItem('token', token);
}

export function clearSession(token = localStorage.getItem('token')) {
  // A delayed response from an old session must not log out a new one.
  if (token !== localStorage.getItem('token')) return;
  localStorage.removeItem('token');
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event('session-expired'));
}

export function checkSession() {
  const token = localStorage.getItem('token');
  const session = readSession();
  if (!token || session?.token !== token || isExpired(session)) {
    if (token) clearSession(token);
    return null;
  }
  return token;
}

export function recordActivity() {
  if (!checkSession()) return;
  const session = readSession();
  const now = Date.now();
  if (now - session.activeAt >= 1000) {
    localStorage.setItem(KEY, JSON.stringify({ ...session, activeAt: now }));
  }
}
