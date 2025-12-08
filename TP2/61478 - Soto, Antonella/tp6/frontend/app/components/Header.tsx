"use client";
import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <header className="flex items-center justify-between px-8 py-5 bg-slate-900 shadow-lg border-b border-slate-700">
      <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
        TP6 Shop
      </h1>
      <nav className="space-x-8 flex items-center">
        <a href="/" className="text-slate-300 hover:text-cyan-400 font-medium transition-all duration-300">
          Productos
        </a>
        {isAuthenticated ? (
          <>
            <a href="/compras" className="text-slate-300 hover:text-cyan-400 font-medium transition-all duration-300">
              Mis compras
            </a>
            <span className="text-slate-100 font-semibold px-5 py-2.5 bg-slate-800 rounded-lg border border-slate-700">
              Bienvenido/a {user?.nombre}
            </span>
            <button 
              onClick={handleLogout} 
              className="text-slate-300 hover:text-red-400 font-medium transition-all duration-300"
            >
              Salir
            </button>
          </>
        ) : (
          <>
            <a href="/login" className="text-slate-300 hover:text-cyan-400 font-medium transition-all duration-300">
              Ingresar
            </a>
            <a href="/register" className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 font-medium transition-all duration-300 shadow-lg shadow-blue-500/20">
              Crear cuenta
            </a>
          </>
        )}
      </nav>
    </header>
  );
}
