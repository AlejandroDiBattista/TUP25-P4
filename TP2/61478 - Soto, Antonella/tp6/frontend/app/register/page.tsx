"use client";
import React, { useState } from "react";

export default function RegisterPage() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");
    try {
      const res = await fetch("http://localhost:8000/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password }),
      });
      if (res.ok) {
        setMensaje("Usuario registrado correctamente. Ahora puedes iniciar sesión.");
        setNombre(""); setEmail(""); setPassword("");
      } else {
        const data = await res.json();
        setMensaje(data.detail || "Error al registrar usuario.");
      }
    } catch {
      setMensaje("Error de conexión con el servidor.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl">
        <h2 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 text-center">
          Crear cuenta
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className="w-full bg-slate-700 border-2 border-slate-600 text-slate-100 placeholder-slate-400 px-4 py-3.5 rounded-xl focus:outline-none focus:border-cyan-500 transition-all duration-300"
            required
          />
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
            Registrarme
          </button>
        </form>
        {mensaje && (
          <p className={`mt-4 text-center py-2.5 rounded-lg border ${
            mensaje.includes('correctamente') 
              ? 'text-green-400 bg-green-400/10 border-green-400/20' 
              : 'text-red-400 bg-red-400/10 border-red-400/20'
          }`}>
            {mensaje}
          </p>
        )}
        <p className="mt-6 text-center text-sm text-slate-400">
          ¿Ya tienes cuenta?{' '}
          <a href="/login" className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  );
}
