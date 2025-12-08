"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";

export default function CrearCuenta() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");  
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!nombre || !correo || !contrasena) {
      setError("Por favor completa todos los campos");
      return;
    }
    
    setLoading(true);
    
    try {
      // Guardar usuario en localStorage
      const usuariosRegistrados = JSON.parse(localStorage.getItem("usuarios_registrados") || "[]");
      
      // Verificar si el correo ya existe
      const existeUsuario = usuariosRegistrados.find((u: any) => u.email.toLowerCase() === correo.toLowerCase());
      if (existeUsuario) {
        setError("Este correo ya está registrado. Por favor inicia sesión.");
        setLoading(false);
        setTimeout(() => router.push("/ingresar"), 2000);
        return;
      }
      
      // Agregar nuevo usuario
      usuariosRegistrados.push({
        email: correo,
        password: contrasena,
        nombre: nombre
      });
      
      localStorage.setItem("usuarios_registrados", JSON.stringify(usuariosRegistrados));
      
      setSuccess("Cuenta creada exitosamente. Redirigiendo...");
      
      // Redirigir al login
      setTimeout(() => router.push("/ingresar"), 1500);
    } catch (err) {
      setError("Error al crear la cuenta. Por favor intenta nuevamente.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Header />

      <div className="auth-form-container">
        <div className="auth-form">
          <h2 className="auth-title">Crear cuenta</h2>
          
          {error && (
            <div style={{
              padding: '12px',
              marginBottom: '16px',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: '4px',
              color: '#c33'
            }}>
              {error}
            </div>
          )}
          
          {success && (
            <div style={{
              padding: '12px',
              marginBottom: '16px',
              backgroundColor: '#efe',
              border: '1px solid #cfc',
              borderRadius: '4px',
              color: '#3c3'
            }}>
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="form-input"
                placeholder="Juan Pérez"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Correo</label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="form-input"
                placeholder="jperez@mail.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                className="form-input"
                placeholder=""
              />
            </div>

            <button type="submit" className="auth-btn">
              Registrarme
            </button>
          </form>

          <div className="auth-link">
            <span>¿Ya tienes cuenta? </span>
            <a onClick={() => router.push("/ingresar")}>Inicia sesión</a>
          </div>
        </div>
      </div>
    </div>
  );
}
