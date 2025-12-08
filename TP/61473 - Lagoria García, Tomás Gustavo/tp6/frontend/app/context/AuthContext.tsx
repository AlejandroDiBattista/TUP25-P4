'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario } from '../types';
import { 
  obtenerUsuario, 
  obtenerToken, 
  eliminarToken, 
  eliminarUsuario,
  cerrarSesion as cerrarSesionAPI
} from '../services/auth';
import { ApiClient } from '../utils/api-client';

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  setUsuario: (usuario: Usuario | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuarioState] = useState<Usuario | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Registrar el handler de sesión expirada
  useEffect(() => {
    ApiClient.setUnauthorizedHandler(() => {
      // Limpiar sesión automáticamente
      eliminarToken();
      eliminarUsuario();
      setUsuarioState(null);
      setTokenState(null);
      
      // Redirigir a login después de un momento
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    });
  }, []);

  // Cargar usuario y token del localStorage al montar
  useEffect(() => {
    const loadAuth = () => {
      try {
        const savedUsuario = obtenerUsuario();
        const savedToken = obtenerToken();
        
        setUsuarioState(savedUsuario);
        setTokenState(savedToken);
      } catch (error) {
        console.error('Error al cargar autenticación:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuth();
  }, []);

  const setUsuario = (user: Usuario | null) => {
    setUsuarioState(user);
  };

  const setToken = (tkn: string | null) => {
    setTokenState(tkn);
  };

  const logout = async () => {
    try {
      // Intentar cerrar sesión en el backend
      if (token) {
        await cerrarSesionAPI(token);
      }
    } catch (error) {
      console.error('Error al cerrar sesión en el servidor:', error);
    } finally {
      // Limpiar estado local siempre
      eliminarToken();
      eliminarUsuario();
      setUsuarioState(null);
      setTokenState(null);
    }
  };

  const value = {
    usuario,
    token,
    setUsuario,
    setToken,
    logout,
    isAuthenticated: !!usuario && !!token,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para usar el contexto de autenticación
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
