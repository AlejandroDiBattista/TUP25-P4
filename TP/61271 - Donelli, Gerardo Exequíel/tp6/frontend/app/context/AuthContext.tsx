'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  guardarToken, 
  obtenerToken, 
  eliminarToken, 
  decodificarToken,
  cerrarSesion as cerrarSesionAPI
} from '../services/auth';
import type { Usuario } from '../services/auth';

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  estaAutenticado: boolean;
  login: (token: string) => void;
  logout: () => Promise<void>;
  cargando: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Cargar token al iniciar
    const tokenGuardado = obtenerToken();
    if (tokenGuardado) {
      const usuarioDecodificado = decodificarToken(tokenGuardado);
      setToken(tokenGuardado);
      setUsuario(usuarioDecodificado);
    }
    setCargando(false);
  }, []);

  const login = (nuevoToken: string) => {
    guardarToken(nuevoToken);
    const usuarioDecodificado = decodificarToken(nuevoToken);
    setToken(nuevoToken);
    setUsuario(usuarioDecodificado);
  };

  const logout = async () => {
    if (token) {
      try {
        await cerrarSesionAPI(token);
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
    }
    eliminarToken();
    setToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        usuario, 
        token, 
        estaAutenticado: !!token, 
        login, 
        logout, 
        cargando 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
