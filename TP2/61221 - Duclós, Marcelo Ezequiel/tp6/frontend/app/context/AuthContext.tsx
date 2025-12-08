'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  fecha_registro: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  login: (email: string, contraseña: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay token guardado en localStorage
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      // Verificar si el token es válido obteniendo el perfil
      fetchProfile(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost:8000/perfil', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUsuario(userData);
        setToken(authToken);
      } else {
        // Token inválido
        localStorage.removeItem('token');
        setToken(null);
        setUsuario(null);
      }
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      localStorage.removeItem('token');
      setToken(null);
      setUsuario(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, contraseña: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:8000/iniciar-sesion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, contraseña }),
      });

      if (response.ok) {
        const data = await response.json();
        const newToken = data.access_token;
        
        setToken(newToken);
        localStorage.setItem('token', newToken);
        
        // Obtener información del usuario
        await fetchProfile(newToken);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch('http://localhost:8000/cerrar-sesion', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      setToken(null);
      setUsuario(null);
      localStorage.removeItem('token');
    }
  };

  const value: AuthContextType = {
    usuario,
    token,
    login,
    logout,
    isAuthenticated: !!usuario && !!token,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
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