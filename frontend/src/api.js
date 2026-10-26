import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const onLogin = window.location.pathname.startsWith('/admin/login');
    if (err.response?.status === 401 && !onLogin) {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
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
