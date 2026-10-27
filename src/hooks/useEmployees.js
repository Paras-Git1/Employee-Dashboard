import { useEffect, useState } from 'react';
import { request } from '../api/http.js';

export function useEmployees(enabled) {
  const [employees, setEmployees] = useState([]);
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    request('/api/employees', { signal: controller.signal })
      .then(setEmployees)
      .catch(() => setEmployees([]));
    return () => controller.abort();
  }, [enabled]);
  return employees;
}
