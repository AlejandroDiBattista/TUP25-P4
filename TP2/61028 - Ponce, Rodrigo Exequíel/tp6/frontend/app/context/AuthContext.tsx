// frontend/app/context/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 1. Definimos la "forma" de nuestro contexto
interface AuthContextType {
  token: string | null;
  isLoggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
}

// 2. Creamos el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Creamos el "Proveedor" (el componente que envuelve la app)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 4. Al cargar la app, revisamos si hay un token en localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsLoggedIn(true);
    }
  }, []);

  const login = (newToken: string) => {
    setToken(newToken);
    setIsLoggedIn(true);
    localStorage.setItem('token', newToken);
  };

  const logout = () => {
    setToken(null);
    setIsLoggedIn(false);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ token, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 5. Creamos un "Hook" personalizado para usar el contexto fácilmente
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}