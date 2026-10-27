import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { request } from '../api/http.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    request('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await request('/auth/login', { method: 'POST', body: { email, password } });
    setNotice('');
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    await request('/auth/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
  }, []);

  // Called when the API rejects the session (expired or revoked).
  const sessionExpired = useCallback(() => {
    setNotice('Your session expired. Please sign in again.');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, checking, notice, login, logout, sessionExpired }),
    [user, checking, notice, login, logout, sessionExpired],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
