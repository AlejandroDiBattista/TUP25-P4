"use client";

import { useState } from "react";
import { Auth } from "../services/productos";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");

  const handleLogin = async () => {
    try {
      await Auth.login(email, contrasena);
      // 🔄 Fuerza recarga para que Navbar lea el usuario
      window.location.href = "/";
    } catch (error) {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-md shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Iniciar sesión
        </h1>

        <label className="block mb-1 text-sm text-gray-700">Correo</label>
        <input
          type="email"
          className="w-full px-4 py-2 border rounded mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="block mb-1 text-sm text-gray-700">Contraseña</label>
        <input
          type="password"
          className="w-full px-4 py-2 border rounded mb-6"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-[#0a1d37] text-white py-2 rounded-md hover:bg-blue-900"
        >
          Entrar
        </button>

        <p className="text-sm mt-4 text-center text-gray-600">
          ¿No tienes cuenta?{" "}
          <a href="/registro" className="text-blue-800 hover:underline">
            Regístrate
          </a>
        </p>
      </div>
    </main>
  );
}
