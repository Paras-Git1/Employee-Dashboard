import { useEffect, useRef, useState } from 'react';
import { API_URL } from '../config.js';

/**
 * Listens to the API's Server-Sent Events stream and calls onEvent for every task change.
 * The browser reconnects by itself if the connection drops. Returns whether it is connected.
 */
export function useTaskEvents(onEvent, { enabled = true } = {}) {
  const handler = useRef(onEvent);
  handler.current = onEvent;
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled || typeof EventSource === 'undefined') return undefined;
    const source = new EventSource(`${API_URL}/api/events`, { withCredentials: true });
    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);
    source.addEventListener('task', (e) => {
      try {
        handler.current(JSON.parse(e.data));
      } catch {
        /* ignore malformed events */
      }
    });
    return () => source.close();
  }, [enabled]);

  return connected;
}
