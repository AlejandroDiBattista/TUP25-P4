'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario } from '../types';
import { iniciarSesion as loginService, registrarUsuario as registerService, cerrarSesion as logoutService, getUsuario, isAuthenticated as checkAuth } from '../services/auth';

interface AuthContextType {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (nombre: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Marcar que estamos en el cliente
    setIsClient(true);
    
    // Cargar usuario del localStorage solo en el cliente
    if (typeof window !== 'undefined') {
      const user = getUsuario();
      if (user) {
        setUsuario(user);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await loginService(email, password);
    setUsuario(data.usuario);
  };

  const register = async (nombre: string, email: string, password: string) => {
    await registerService(nombre, email, password);
    // Después de registrar, hacer login automático
    await login(email, password);
  };

  const logout = () => {
    logoutService();
    setUsuario(null);
  };

  // Solo retornar isAuthenticated si estamos en el cliente
  const authenticated = isClient && typeof window !== 'undefined' ? checkAuth() : false;

  return (
    <AuthContext.Provider value={{
      usuario,
      isAuthenticated: authenticated,
      login,
      register,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
