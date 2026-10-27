const trim = (url) => url.replace(/\/+$/, '');

export const API_URL = trim(import.meta.env.VITE_API_URL || 'http://localhost:3001');
export const AUTH_URL = trim(import.meta.env.VITE_AUTH_URL || 'http://localhost:4003');
