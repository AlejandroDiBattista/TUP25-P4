"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";

const BACK = process.env.NEXT_PUBLIC_BACKEND || "http://127.0.0.1:8000";

export default function IngresarPage() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!correo || !contrasena) {
      setError("Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    
    try {
      // Usuarios predefinidos
      const usuariosValidos = [
        { email: "admin@mail.com", password: "admin123", nombre: "Admin" },
        { email: "user@mail.com", password: "user123", nombre: "Usuario" },
        { email: "test@mail.com", password: "test123", nombre: "Test" }
      ];
      
      // Usuarios registrados desde localStorage
      const usuariosRegistrados = JSON.parse(localStorage.getItem("usuarios_registrados") || "[]");
      
      // Combinar ambas listas
      const todosLosUsuarios = [...usuariosValidos, ...usuariosRegistrados];
      
      const usuarioValido = todosLosUsuarios.find(
        u => u.email.toLowerCase() === correo.toLowerCase() && u.password === contrasena
      );
      
      if (!usuarioValido) {
        setError("Correo o contraseña incorrectos");
        setLoading(false);
        return;
      }
      
      // Login exitoso
      const simulatedToken = "local_token_" + Date.now();
      
      localStorage.setItem("tp_token", simulatedToken);
      localStorage.setItem("user_name", usuarioValido.nombre);
      
      // Disparar evento de autenticación
      window.dispatchEvent(new Event("authChanged"));
      
      const carrito = JSON.parse(localStorage.getItem("temp_cart") || "[]");
      if (carrito.length > 0) {
        router.push("/checkout");
      } else {
        router.push("/");
      }
      
    } catch (err) {
      setError("Error inesperado al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Header */}
      <Header />

      {/* Formulario de inicio de sesión */}
      <div className="auth-form-container">
        <div className="auth-form">
          <h2 className="auth-title">Iniciar sesión</h2>
          
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Correo</label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="form-input"
                placeholder="tu@email.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                className="form-input"
                placeholder="Tu contraseña"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-btn"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="auth-link">
            <span>¿No tienes cuenta? </span>
            <a onClick={() => router.push("/crear-cuenta")}>Regístrate</a>
          </div>
        </div>
      </div>
    </div>
  );
}