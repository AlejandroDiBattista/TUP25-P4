"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegistrarPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre,
          email: correo,
          password: contrasena,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("usuario", nombre);

        alert("Usuario registrado correctamente");
        router.push("/iniciar-sesion");
      } else {
        const data = await response.json();
        alert(data.detail || "Error al registrar usuario");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión con el servidor");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Crear cuenta
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Juan Perez"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:ring-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Correo
            </label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="jperez@mail.com"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:ring-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:ring-black"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
          >
            Registrarme
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          ¿Ya tienes cuenta?{" "}
          <a
            href="/iniciar-sesion"
            className="text-gray-900 font-medium hover:underline"
          >
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  );
}