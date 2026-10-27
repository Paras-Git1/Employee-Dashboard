const trim = (url) => url.replace(/\/+$/, '');

// Production builds default to the same origin: the host (vercel.json) forwards /api, /auth and the
// task detail pages to the backend, so the session cookie stays first-party. Dev talks to the local services.
const pick = (value, devDefault) => trim(value ?? (import.meta.env.PROD ? '' : devDefault));

export const API_URL = pick(import.meta.env.VITE_API_URL, 'http://localhost:3001');
export const AUTH_URL = pick(import.meta.env.VITE_AUTH_URL, 'http://localhost:4003');
