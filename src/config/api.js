export const API_URL = import.meta.env.VITE_API_URL?.trim().replace(/\/+$|^\s+|\s+$/g, '') || '/api';

export const buildApiPath = (path) => {
  if (!path) return API_URL;
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};
