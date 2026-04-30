const TOKEN_KEY = 'token';
const LEGACY_TOKEN_KEY = 'auth_token';
const USER_KEY = 'sso_user';
const RETURN_TO_KEY = 'sso_return_to';
const SESSION_EVENT = 'sso-session-changed';
const SSO_BASE_URL = (import.meta.env.VITE_SSO_BASE_URL || 'https://sso.qode.my.id').replace(/\/$/, '');
const SSO_DASHBOARD_PATH = (import.meta.env.VITE_SSO_DASHBOARD_PATH || '/dashboard').startsWith('/')
  ? (import.meta.env.VITE_SSO_DASHBOARD_PATH || '/dashboard')
  : `/${import.meta.env.VITE_SSO_DASHBOARD_PATH || 'dashboard'}`;

function emitSessionChange() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function getStoredSsoToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
}

export function getStoredSsoUser() {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getStoredSsoSession() {
  const token = getStoredSsoToken();
  const user = getStoredSsoUser();

  if (!token && !user) {
    return null;
  }

  return { token, user };
}

export function saveSsoSession({ token, user }) {
  if (typeof window === 'undefined') {
    return;
  }

  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(LEGACY_TOKEN_KEY, token);
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }

  emitSessionChange();
}

export function clearSsoSession() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(RETURN_TO_KEY);
  emitSessionChange();
}

export function rememberReturnTo(path = '/') {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(RETURN_TO_KEY, path || '/');
}

export function getReturnToPath() {
  if (typeof window === 'undefined') {
    return '/';
  }

  return localStorage.getItem(RETURN_TO_KEY) || '/';
}

export function clearReturnToPath() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(RETURN_TO_KEY);
}

export function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function listenSsoSessionChange(handler) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener(SESSION_EVENT, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(SESSION_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

export function getSsoDashboardUrl(user = null, token = null) {
  const role = String(user?.role || '').toLowerCase();
  const query = new URLSearchParams();
  query.set('source', 'smartcity');

  if (token) {
    query.set('token', token);
    query.set('auth_token', token);
  }

  if (role === 'admin' && import.meta.env.VITE_SSO_ADMIN_DASHBOARD_PATH) {
    const adminPath = import.meta.env.VITE_SSO_ADMIN_DASHBOARD_PATH;
    const url = `${SSO_BASE_URL}${adminPath.startsWith('/') ? adminPath : `/${adminPath}`}`;
    return query.toString() ? `${url}?${query.toString()}` : url;
  }

  if (role === 'superadmin' && import.meta.env.VITE_SSO_SUPERADMIN_DASHBOARD_PATH) {
    const superAdminPath = import.meta.env.VITE_SSO_SUPERADMIN_DASHBOARD_PATH;
    const url = `${SSO_BASE_URL}${superAdminPath.startsWith('/') ? superAdminPath : `/${superAdminPath}`}`;
    return query.toString() ? `${url}?${query.toString()}` : url;
  }

  const url = `${SSO_BASE_URL}${SSO_DASHBOARD_PATH}`;
  return query.toString() ? `${url}?${query.toString()}` : url;
}
