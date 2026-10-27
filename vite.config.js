import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// The frontend is a standalone app. It calls the API and auth services directly
// at VITE_API_URL / VITE_AUTH_URL, so it can be hosted anywhere.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const port = Number(env.VITE_PORT) || 5173;
  return {
    plugins: [react()],
    server: { port, strictPort: true },
    preview: { port, strictPort: true },
    test: {
      environment: 'jsdom',
      setupFiles: ['./tests/setup.js'],
      globals: true,
    },
  };
});
