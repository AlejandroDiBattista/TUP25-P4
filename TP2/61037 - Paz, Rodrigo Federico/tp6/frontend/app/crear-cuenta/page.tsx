"use client";

import { useState } from "react";
import Toast from "../components/Toast";

export default function CrearCuentaPage() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const respuesta = await fetch(`${API_URL}/registrar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, password }),
    });

    if (respuesta.ok) {
      setToast({ message: "Registro exitoso. Ahora inicia sesión.", type: "success" });
      setTimeout(() => {
        window.location.href = "/ingresar";
      }, 1500);
    } else {
      setToast({ message: "Error al registrarte. Verifica los datos ingresados.", type: "error" });
    }
  };

  return (
    <main className="flex justify-center py-16 px-4 bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="w-full max-w-md bg-white border rounded-lg p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8 text-left">Crear cuenta</h1>

        <form className="space-y-5" onSubmit={handleRegistro}>
          <div>
            <label className="text-sm text-gray-900">Nombre</label>
            <input
              type="text"
              className="w-full border rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-900">Correo</label>
            <input
              type="email"
              className="w-full border rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-900">Contraseña</label>
            <input
              type="password"
              className="w-full border rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#0A2540] hover:bg-[#0D3158] text-white py-2 rounded-md transition font-medium"
          >
            Registrarme
          </button>

          <p className="text-sm text-gray-600 text-center">
            ¿Ya tienes cuenta?{" "}
            <a href="/ingresar" className="text-gray-900 font-medium hover:underline">
              Inicia sesión
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
