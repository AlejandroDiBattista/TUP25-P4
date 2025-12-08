"use client";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { logout as apiLogout, obtenerPerfil } from "@/lib/api";

interface AuthState {
  authenticated: boolean;
  userName: string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  const syncFromStorage = useCallback(() => {
    if (typeof window === "undefined") return;
    setAuthenticated(Boolean(localStorage.getItem("token")));
  }, []);

  useEffect(() => {
    syncFromStorage();
    const handler = () => syncFromStorage();
    window.addEventListener("token-changed", handler);
    return () => window.removeEventListener("token-changed", handler);
  }, [syncFromStorage]);

  // Cargar nombre cuando hay token
  useEffect(() => {
    const run = async () => {
      if (!authenticated) {
        setUserName(null);
        return;
      }
      try {
        const p = await obtenerPerfil();
        setUserName(p.nombre || p.email);
      } catch {
        setUserName(null);
      }
    };
    run();
  }, [authenticated]);

  const logout = useCallback(() => {
    apiLogout();
  }, []);

  return (
    <AuthContext.Provider value={{ authenticated, userName, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
