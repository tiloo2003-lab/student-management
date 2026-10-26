import { useCallback, useState } from 'react';
import api from '../../api';

const readLiked = () => {
  try { return JSON.parse(localStorage.getItem('liked_posts') || '[]'); } catch { return []; }
};

export function useLikes() {
  const [liked, setLiked] = useState(readLiked);
  const toggle = useCallback(async (id) => {
    const has = readLiked().includes(id);
    const { data } = has ? await api.delete(`/posts/${id}/like`) : await api.post(`/posts/${id}/like`);
    const next = has ? readLiked().filter((x) => x !== id) : [...readLiked(), id];
    localStorage.setItem('liked_posts', JSON.stringify(next));
    setLiked(next);
    return data.likes_count;
  }, []);
  return { liked, toggle };
}

export const readMinutes = (text) => Math.max(1, Math.round((text || '').split(/\s+/).length / 180));

export const fmtNumber = (n) => new Intl.NumberFormat('en-US').format(n ?? 0);

export const timeAgo = (d) => {
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)} d ago`;
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}`;
};
