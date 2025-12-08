'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Usuario {
  email: string;
  nombre: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  isLoading: boolean;
  registrar: (email: string, password: string, nombre: string) => Promise<void>;
  iniciarSesion: (email: string, password: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Cargar token del localStorage al montar
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUsuario = localStorage.getItem('usuario');
    if (savedToken && savedUsuario) {
      setToken(savedToken);
      setUsuario(JSON.parse(savedUsuario));
    }
    setIsLoading(false);
  }, []);

  const registrar = async (email: string, password: string, nombre: string) => {
    const response = await fetch(`${API_URL}/registrar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, nombre }),
    });
    if (!response.ok) {
      throw new Error('Error al registrar');
    }
  };

  const iniciarSesion = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/iniciar-sesion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      throw new Error('Credenciales inválidas');
    }
    const data = await response.json();
    setToken(data.access_token);
    setUsuario({ email, nombre: email });
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('usuario', JSON.stringify({ email, nombre: email }));
  };

  const cerrarSesion = async () => {
    if (token) {
      try {
        await fetch(`${API_URL}/cerrar-sesion`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
    }
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  };

  return (
    <AuthContext.Provider value={{ usuario, token, isLoading, registrar, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
