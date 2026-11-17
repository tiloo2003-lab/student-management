import axios from 'axios';
import { checkSession, clearSession } from './session';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  headers: { Accept: 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((cfg) => {
  const token = cfg.url === '/login' ? null : checkSession();
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => {
    if (r.config.method !== 'get' && r.config.url?.includes('categories')) {
      window.dispatchEvent(new Event('categories-changed'));
    }
    return r;
  },
  (err) => {
    const authorization = err.config?.headers?.Authorization;
    if (err.response?.status === 401 && authorization?.startsWith('Bearer ')) {
      clearSession(authorization.slice(7));
    }
    return Promise.reject(err);
  }
);

export const errMsg = (e) => {
  const d = e.response?.data;
  if (d?.errors) return Object.values(d.errors).flat().join(' ');
  return d?.message || e.message || 'Something went wrong';
};

export const fieldErrors = (e) => e.response?.data?.errors || {};

export default api;
