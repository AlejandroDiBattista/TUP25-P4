'use client';

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  cerrarSesion,
  iniciarSesion,
  obtenerUsuarioActual,
  registrar,
} from '../services/auth';
import {
  CredencialesIngreso,
  DatosRegistro,
  UsuarioPublico,
  UsuarioSesion,
} from '../types';

interface AuthValue {
  usuario: UsuarioSesion | null;
  token: string | null;
  initialLoading: boolean;
  login: (credenciales: CredencialesIngreso) => Promise<void>;
  logout: () => Promise<void>;
  register: (datos: DatosRegistro) => Promise<UsuarioPublico>;
}

interface AuthSnapshot {
  token: string;
  usuario: UsuarioSesion;
}

const STORAGE_KEY = 'tp6-auth';

const AuthContext = createContext<AuthValue | undefined>(undefined);

function readSnapshot(): AuthSnapshot | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return null;
  }
  try {
    return JSON.parse(stored) as AuthSnapshot;
  } catch (error) {
    console.warn('No se pudo leer el estado de autenticación almacenado', error);
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function writeSnapshot(snapshot: AuthSnapshot | null) {
  if (typeof window === 'undefined') {
    return;
  }
  if (!snapshot) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const snapshot = readSnapshot();
    startTransition(() => {
      setUsuario(snapshot ? snapshot.usuario : null);
      setToken(snapshot ? snapshot.token : null);
      setInitialLoading(false);
    });
  }, []);

  const login = useCallback(async (credenciales: CredencialesIngreso) => {
    const respuesta = await iniciarSesion(credenciales);
    const session = await obtenerUsuarioActual(respuesta.access_token, {
      email: credenciales.email,
    });
    if (!session) {
      throw new Error('No se pudo validar la sesión.');
    }

    const snapshot: AuthSnapshot = {
      token: respuesta.access_token,
      usuario: session,
    };

    writeSnapshot(snapshot);
    setUsuario(snapshot.usuario);
    setToken(snapshot.token);
  }, []);

  const logout = useCallback(async () => {
    if (token) {
      try {
        await cerrarSesion(token);
      } catch (error) {
        console.warn('Fallo al cerrar sesión en el servidor', error);
      }
    }
    writeSnapshot(null);
    setUsuario(null);
    setToken(null);
  }, [token]);

  const register = useCallback(async (datos: DatosRegistro) => {
    const usuarioCreado = await registrar(datos);
    return usuarioCreado;
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ usuario, token, initialLoading, login, logout, register }),
    [usuario, token, initialLoading, login, logout, register],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de AuthProvider');
  }
  return context;
}
