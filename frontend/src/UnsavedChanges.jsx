import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useBlocker } from 'react-router-dom';
import { confirmDialog } from './notify';
import { useAuth } from './auth';

const Context = createContext(null);
export function UnsavedChangesProvider({ children }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState({});
  const dirty = Object.values(entries).some(Boolean);
  const handling = useRef(false);
  const blocker = useBlocker(({ currentLocation, nextLocation }) => !!user && dirty &&
    (currentLocation.pathname !== nextLocation.pathname || currentLocation.search !== nextLocation.search));
  const confirmLeave = async () => {
    const ok = !dirty || await confirmDialog({ title: 'Leave without saving?', text: 'Your unsaved changes will be lost.', confirmText: 'Leave page', danger: true });
    if (ok) setEntries({});
    return ok;
  };
  useEffect(() => {
    if (blocker.state !== 'blocked' || handling.current) return;
    handling.current = true;
    confirmDialog({ title: 'Leave without saving?', text: 'Your unsaved changes will be lost.', confirmText: 'Leave page', danger: true })
      .then((ok) => { if (ok) blocker.proceed(); else blocker.reset(); })
      .finally(() => { handling.current = false; });
  }, [blocker]);
  useEffect(() => {
    const warn = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  return <Context.Provider value={{ setEntries, confirmLeave }}>{children}</Context.Provider>;
}
export function useUnsavedChanges(dirty) {
  const { setEntries } = useContext(Context);
  const key = useRef(crypto.randomUUID());
  useEffect(() => {
    const id = key.current;
    setEntries((items) => ({ ...items, [id]: dirty }));
    return () => setEntries((items) => { const next = { ...items }; delete next[id]; return next; });
  }, [dirty, setEntries]);
}
export const useConfirmLeave = () => useContext(Context).confirmLeave;
