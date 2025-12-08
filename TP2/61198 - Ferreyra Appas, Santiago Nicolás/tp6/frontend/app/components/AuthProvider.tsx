
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  token: string | null;
  nombre: string | null;
  login: (token: string, nombre: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [nombre, setNombre] = useState<string | null>(null);

  useEffect(() => {
    const t = window.localStorage.getItem("tp6_token");
    const n = window.localStorage.getItem("tp6_nombre");
    if (t) setToken(t);
    if (n) setNombre(n);
  }, []);

  const login = (t: string, n: string) => {
    setToken(t);
    setNombre(n);
    window.localStorage.setItem("tp6_token", t);
    window.localStorage.setItem("tp6_nombre", n);
  };

  const logout = () => {
    setToken(null);
    setNombre(null);
    window.localStorage.removeItem("tp6_token");
    window.localStorage.removeItem("tp6_nombre");
  };

  return (
    <AuthContext.Provider value={{ token, nombre, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthProvider no inicializado");
  return ctx;
};
