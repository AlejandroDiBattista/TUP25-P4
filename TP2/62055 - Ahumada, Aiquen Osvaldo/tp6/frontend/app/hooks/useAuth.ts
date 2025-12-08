"use client";

import { useState, useEffect } from 'react';
import { getToken, getUser, logout } from '../services/auth';

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const syncAuth = () => {
      const storedToken = getToken();
      const storedUser = getUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        setError(null);
      } else {
        setToken(null);
        setUser(null);
        if (storedToken || storedUser) {
          setError('Tu sesión no es válida. Iniciá sesión nuevamente.');
        } else {
          setError(null);
        }
      }

      setLoading(false);
    };

    syncAuth();
    const handleStorage = () => syncAuth();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('auth-updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('auth-updated', handleStorage);
    };
  }, []);

  function signOut() {
    logout();
    setToken(null);
    setUser(null);
    setError(null);
    setLoading(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-updated'));
    }
  }

  return { token, user, signOut, isAuthenticated: !!token, error, loading };
}
