'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { getToken, removeToken, getUserData } from '@/lib/auth';
import { obtenerCarrito, Carrito } from '@/app/services/carrito';

interface UserData {
  email: string;
  nombre?: string;
}

interface AuthContextType {
  user: UserData | null;
  isAuthenticated: boolean;
  logout: () => void;
}

interface CarritoContextType {
  carrito: Carrito | null;
  refreshCarrito: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar si hay sesión al montar el componente
    const token = getToken();
    if (token) {
      const userData = getUserData();
      if (userData?.sub) {
        setUser({ email: userData.sub });
        setIsAuthenticated(true);
      }
    }
  }, []);

  const logout = () => {
    removeToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = useMemo(() => ({ user, isAuthenticated, logout }), [user, isAuthenticated]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function CarritoProvider({ children }: { readonly children: ReactNode }) {
  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const refreshCarrito = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const carritoData = await obtenerCarrito();
      setCarrito(carritoData);
    } catch (error) {
      console.error('Error al obtener carrito:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshCarrito();
    }
  }, [isAuthenticated]);

  const value = useMemo(() => ({ carrito, refreshCarrito, isLoading }), [carrito, isLoading]);

  return (
    <CarritoContext.Provider value={value}>
      {children}
    </CarritoContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
}

export function useCarrito() {
  const context = useContext(CarritoContext);
  if (context === undefined) {
    throw new Error('useCarrito debe ser usado dentro de CarritoProvider');
  }
  return context;
}
