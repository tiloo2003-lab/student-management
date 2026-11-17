import { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from './api';

export default function useResource(url) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const retry = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError('');
    api.get(url, { signal: ctrl.signal }).then((r) => {
      setData(r.data);
    }).catch((e) => {
      if (!ctrl.signal.aborted) setError(errMsg(e));
    }).finally(() => { if (!ctrl.signal.aborted) setLoading(false); });
    return () => ctrl.abort();
  }, [url, version]);
  return { data, setData, error, loading, retry };
}
