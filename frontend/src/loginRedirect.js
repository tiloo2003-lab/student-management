// Only article URLs can override the default post-login home page.
export function articleRedirect(value) {
  return typeof value === 'string' && /^\/posts\/[1-9]\d*(?:[?#][^\r\n]*)?$/.test(value)
    ? value
    : '/';
}

export function loginUrlFor(location, logoutRequested = false) {
  if (logoutRequested) return '/login';
  const target = articleRedirect(location.pathname + location.search + location.hash);
  return target === '/' ? '/login' : `/login?redirect=${encodeURIComponent(target)}`;
}
