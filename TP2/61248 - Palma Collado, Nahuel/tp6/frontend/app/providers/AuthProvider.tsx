'use client';

import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cerrarSesion, iniciarSesion, obtenerPerfil, registrarUsuario } from '../services/auth';
import { TokenResponse, Usuario } from '../types';

interface AuthContextValue {
  usuario: Usuario | null;
  token: string | null;
  cargando: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (nombre: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'tp6-token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      setCargando(false);
      return;
    }

    obtenerPerfil(storedToken)
      .then((perfil) => {
        setUsuario(perfil);
        setToken(storedToken);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setCargando(false));
  }, []);

  const persistToken = useCallback((response: TokenResponse) => {
    localStorage.setItem(TOKEN_KEY, response.access_token);
    setToken(response.access_token);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const tokenResponse = await iniciarSesion({ email, password });
    persistToken(tokenResponse);
    const perfil = await obtenerPerfil(tokenResponse.access_token);
    setUsuario(perfil);
  }, [persistToken]);

  const register = useCallback(async (nombre: string, email: string, password: string) => {
    await registrarUsuario({ nombre, email, password });
    await login(email, password);
  }, [login]);

  const logout = useCallback(async () => {
    if (token) {
      try {
        await cerrarSesion(token);
      } catch (error) {
        console.error('Error al cerrar sesión', error);
      }
    }
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUsuario(null);
  }, [token]);

  const value = useMemo(
    () => ({ usuario, token, cargando, login, register, logout }),
    [usuario, token, cargando, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
