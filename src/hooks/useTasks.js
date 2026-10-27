import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, request } from '../api/http.js';

// Changes are pushed live over /api/events. This slow background refresh is only a safety net,
// for example if the live connection dropped or data was changed directly in the CRM or Helpdesk.
export const AUTO_REFRESH_MS = 120_000;

function buildQuery({ employee, status, source }) {
  const params = new URLSearchParams();
  if (employee) params.set('employee', employee);
  if (status) params.set('status', status);
  if (source) params.set('source', source);
  const query = params.toString();
  return query ? `/api/tasks?${query}` : '/api/tasks';
}

/**
 * Fetches /api/tasks whenever the filters change, and quietly every AUTO_REFRESH_MS.
 * status: 'loading' | 'ready' | 'error'
 *  - errors: per-source failures from a partial response (shown as a banner)
 *  - error: message when nothing could be loaded (both sources down or backend unreachable)
 */
export function useTasks(filters, { onUnauthorized, onInvalidFilters, refreshMs = AUTO_REFRESH_MS } = {}) {
  const [state, setState] = useState({ status: 'loading', tasks: [], errors: [], sources: [], error: null, updatedAt: null });
  const [attempt, setAttempt] = useState(0);
  const silentRef = useRef(false);
  const url = buildQuery(filters);

  useEffect(() => {
    const controller = new AbortController();
    const silent = silentRef.current;
    silentRef.current = false;
    if (!silent) setState((s) => ({ ...s, status: 'loading' }));

    request(url, { signal: controller.signal })
      .then((data) => {
        setState({ status: 'ready', tasks: data.tasks, errors: data.errors, sources: data.sources ?? [], error: null, updatedAt: data.generatedAt });
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        if (err instanceof ApiError && err.status === 401) return onUnauthorized?.();
        // A failed background refresh keeps the list the user is looking at.
        if (silent) return;
        if (err instanceof ApiError && (err.status === 400 || err.status === 403)) onInvalidFilters?.();
        const bothDown = err instanceof ApiError && err.status === 502;
        setState({
          status: 'error',
          tasks: [],
          errors: bothDown ? err.body?.errors ?? [] : [],
          sources: bothDown ? err.body?.sources ?? [] : [],
          error: bothDown ? 'None of the task sources could be reached.' : err.message,
          updatedAt: null,
        });
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, attempt]);

  // Background refresh, paused while the tab is hidden.
  useEffect(() => {
    if (!refreshMs) return undefined;
    const id = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      silentRef.current = true;
      setAttempt((n) => n + 1);
    }, refreshMs);
    return () => clearInterval(id);
  }, [refreshMs]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  // Refetch without dimming the list (used after a successful change).
  const refresh = useCallback(() => {
    silentRef.current = true;
    setAttempt((n) => n + 1);
  }, []);

  return { ...state, loading: state.status === 'loading', retry, refresh };
}
