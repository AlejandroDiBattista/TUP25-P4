"use client";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");
    try {
      const res = await fetch("http://localhost:8000/iniciar-sesion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        const token = data.access_token;
        
        // Obtener datos del usuario
        const userRes = await fetch("http://localhost:8000/usuarios/me", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        let nombre = email.split("@")[0]; // Fallback
        if (userRes.ok) {
          const userData = await userRes.json();
          nombre = userData.nombre || nombre;
        }
        
        login(token, email, nombre);
        window.location.href = "/";
      } else {
        const data = await res.json();
        setMensaje(data.detail || "Error al iniciar sesión.");
      }
    } catch {
      setMensaje("Error de conexión con el servidor.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl">
        <h2 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 text-center">
          Iniciar sesión
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-slate-700 border-2 border-slate-600 text-slate-100 placeholder-slate-400 px-4 py-3.5 rounded-xl focus:outline-none focus:border-cyan-500 transition-all duration-300"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-slate-700 border-2 border-slate-600 text-slate-100 placeholder-slate-400 px-4 py-3.5 rounded-xl focus:outline-none focus:border-cyan-500 transition-all duration-300"
            required
          />
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3.5 rounded-xl hover:from-blue-700 hover:to-cyan-700 font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300"
          >
            Entrar
          </button>
        </form>
        {mensaje && (
          <p className="mt-4 text-center text-red-400 bg-red-400/10 border border-red-400/20 py-2.5 rounded-lg">
            {mensaje}
          </p>
        )}
        <p className="mt-6 text-center text-sm text-slate-400">
          ¿No tienes cuenta?{' '}
          <a href="/register" className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
            Regístrate
          </a>
        </p>
      </div>
    </div>
  );
}
