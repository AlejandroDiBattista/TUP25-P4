"use client";
import React, { useState } from "react";
import { AuthForm } from "./components/AuthForm";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  interface Usuario {
    usuario_id: number;
    nombre: string;
    email: string;
    access_token?: string;
    token_type?: string;
  }
  const [user, setUser] = useState<Usuario | null>(null);

  const handleAuthSuccess = (token: string, user: Usuario) => {
    setToken(token);
    setUser(user);
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      {!token ? (
        <AuthForm onAuthSuccess={handleAuthSuccess} />
      ) : (
        <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow bg-white">
          <h1 className="text-2xl font-bold mb-4 text-center">Bienvenido, {user?.nombre || user?.email}</h1>
          <p className="mb-4">Ya estás autenticado. Puedes navegar por la tienda.</p>
          <button
            className="w-full bg-red-600 text-white py-2 rounded font-semibold"
            onClick={() => {
              setToken(null);
              setUser(null);
              localStorage.removeItem("token");
              localStorage.removeItem("user");
            }}
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </main>
  );
}
