'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { iniciarSesion, cerrarSesion, registrarUsuario, LoginData, RegistroData } from '../services/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegistroData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verificarSesion();
  }, []);

  const verificarSesion = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/me`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    await iniciarSesion(data);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await cerrarSesion();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
    setIsAuthenticated(false);
  };

  const register = async (data: RegistroData) => {
    await registrarUsuario(data);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
