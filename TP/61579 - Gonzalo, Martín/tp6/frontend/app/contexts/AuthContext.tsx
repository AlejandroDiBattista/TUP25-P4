'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario } from '../types';
import { obtenerMiUsuario, obtenerToken, guardarToken, eliminarToken } from '../services/auth';

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  estaLogueado: boolean;
  cargando: boolean;
  setToken: (token: string) => void;
  cerrarSesion: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  // Cargar token y usuario al montar
  useEffect(() => {
    const token = obtenerToken();
    if (token) {
      setTokenState(token);
      // Intentar obtener los datos del usuario
      obtenerMiUsuario(token)
        .then((usuario) => {
          setUsuario(usuario);
        })
        .catch(() => {
          // Token inválido, limpiar
          eliminarToken();
          setTokenState(null);
        })
        .finally(() => {
          setCargando(false);
        });
    } else {
      setCargando(false);
    }
  }, []);

  const setToken = (nuevoToken: string) => {
    guardarToken(nuevoToken);
    setTokenState(nuevoToken);
    
    // Obtener datos del usuario con el nuevo token
    obtenerMiUsuario(nuevoToken)
      .then((usuario) => {
        setUsuario(usuario);
      })
      .catch((err) => {
        console.error('Error al obtener usuario:', err);
        eliminarToken();
        setTokenState(null);
      });
  };

  const cerrarSesion = () => {
    eliminarToken();
    setTokenState(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        estaLogueado: !!token && !!usuario,
        cargando,
        setToken,
        cerrarSesion,
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
