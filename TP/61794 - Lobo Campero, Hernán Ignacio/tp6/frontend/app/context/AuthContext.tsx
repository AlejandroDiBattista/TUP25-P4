'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { SesionData, Usuario } from '../types';
import { registrar, iniciarSesion, cerrarSesion, guardarSesion, obtenerSesion, limpiarSesion } from '../services/auth';

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  isLoading: boolean;
  isAutenticado: boolean;
  registrarse: (nombre: string, email: string, password: string) => Promise<void>;
  iniciarSesion: (email: string, password: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar sesión del localStorage al montar el componente
  useEffect(() => {
    const sesion = obtenerSesion();
    if (sesion) {
      setUsuario(sesion.usuario);
      setToken(sesion.token);
    }
    setIsLoading(false);
  }, []);

  const registrarse = async (nombre: string, email: string, password: string) => {
    const data = await registrar(nombre, email, password);
    setUsuario(data.usuario);
    setToken(data.token);
    guardarSesion(data);
  };

  const handleInitarSesion = async (email: string, password: string) => {
    const data = await iniciarSesion(email, password);
    setUsuario(data.usuario);
    setToken(data.token);
    guardarSesion(data);
  };

  const handleCerrarSesion = async () => {
    if (token) {
      try {
        await cerrarSesion(token);
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
    }
    setUsuario(null);
    setToken(null);
    limpiarSesion();
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        isLoading,
        isAutenticado: !!usuario && !!token,
        registrarse,
        iniciarSesion: handleInitarSesion,
        cerrarSesion: handleCerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
}
