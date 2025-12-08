"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type User = {
  nombre: string;
  email: string;
  token: string;
};

type AuthContextType = {
  user: User | null;
  login: (token: string, email: string, nombre: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar usuario del localStorage al iniciar
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    const nombre = localStorage.getItem("nombre");
    if (token && email && nombre) {
      setUser({ token, email, nombre });
    }
    setLoading(false);
  }, []);

  const login = (token: string, email: string, nombre: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("email", email);
    localStorage.setItem("nombre", nombre);
    setUser({ token, email, nombre });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("nombre");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
