const rawApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/^\s+|\s+$/g, '') || '';

const normalizeApiBase = (url) => {
  if (!url) return '/api';
  const trimmed = url.replace(/\/+$|^\s+|\s+$/g, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

export const API_URL = normalizeApiBase(rawApiUrl);

export const buildApiPath = (path) => {
  if (!path) return API_URL;
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};
