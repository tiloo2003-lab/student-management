import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import api, { errMsg } from './api';
import { useAuth } from './auth';
import { notify } from './notify';
import useResource from './useResource';

const Context = createContext(null);
export function PortalDataProvider({ children }) {
  const { user } = useAuth();
  return user ? <Data key={user.id}>{children}</Data> : children;
}
function Data({ children }) {
  const categories = useResource('/categories');
  const [liked, setLiked] = useState([]);
  const ready = useRef(false);
  const likedRef = useRef([]);
  const pending = useRef(new Set());
  const [counts, setCounts] = useState({});
  useEffect(() => {
    window.addEventListener('categories-changed', categories.retry);
    return () => window.removeEventListener('categories-changed', categories.retry);
  }, [categories.retry]);
  useEffect(() => {
    const ctrl = new AbortController();
    api.get('/me/likes', { signal: ctrl.signal }).then((r) => {
      likedRef.current = r.data; setLiked(r.data); ready.current = true;
    }).catch((e) => { if (!ctrl.signal.aborted) notify(`Likes unavailable: ${errMsg(e)}`, 'bad'); });
    return () => ctrl.abort();
  }, []);
  const toggle = useCallback(async (id) => {
    if (pending.current.has(id)) return null;
    pending.current.add(id);
    try {
      if (!ready.current) {
        const response = await api.get('/me/likes');
        likedRef.current = response.data; setLiked(response.data); ready.current = true;
      }
      const has = likedRef.current.includes(id);
      const { data } = await api({ method: has ? 'delete' : 'post', url: `/posts/${id}/like` });
      likedRef.current = has ? likedRef.current.filter((x) => x !== id) : [...likedRef.current, id];
      setLiked(likedRef.current);
      setCounts((prev) => ({ ...prev, [id]: data.likes_count }));
      return data.likes_count;
    } catch (e) { notify(errMsg(e), 'bad'); return null; }
    finally { pending.current.delete(id); }
  }, []);
  return <Context.Provider value={{ categories, liked, toggle, counts }}>{children}</Context.Provider>;
}
export const usePortalData = () => useContext(Context);
