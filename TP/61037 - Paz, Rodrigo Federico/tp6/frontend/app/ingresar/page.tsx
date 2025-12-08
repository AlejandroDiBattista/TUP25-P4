"use client";

import { useState } from "react";
import Toast from "../components/Toast";

export default function IngresarPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  async function handleLogin() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const response = await fetch(
        `${API_URL}/iniciar-sesion?email=${email}&password=${password}`,
        { method: "POST" }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        setToast({ message: error.detail || "Correo o contraseña incorrectos", type: "error" });
        return;
      }

      const data = await response.json();

      localStorage.setItem("usuario_id", data.usuario_id);
      localStorage.setItem("usuario_nombre", data.usuario);

      setToast({ message: "Inicio de sesión exitoso", type: "success" });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      setToast({ message: "Error de conexión. Intenta nuevamente.", type: "error" });
    }
  }

  return (
    <main className="flex justify-center py-16 px-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="w-full max-w-md bg-white border rounded-lg p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8 text-left">
          Iniciar sesión
        </h1>

        <div className="mb-5">
          <label className="text-sm text-gray-700">Correo</label>
          <input
            type="email"
             className="w-full border rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="mb-6">
          <label className="text-sm text-gray-700">Contraseña</label>
          <input
            type="password"
             className="w-full border rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-[#0A2540] hover:bg-[#0D3158] text-white py-2 rounded-md transition font-medium"
        >
          Entrar
        </button>

        <p className="text-sm text-gray-600 text-center mt-4">
          ¿No tienes cuenta?{" "}
          <a href="/crear-cuenta" className="text-gray-900 font-medium hover:underline">
            Regístrate
          </a>
        </p>
      </div>
    </main>
  );
}
