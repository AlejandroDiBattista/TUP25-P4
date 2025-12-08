"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  try {
    const formData = new FormData();
    formData.append("username", email); 
    formData.append("password", password);

    const response = await fetch("http://localhost:8000/iniciar-sesion", {
      method: "POST",
      body: formData, // enviamos como FormData
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || "Usuario o contraseña incorrectos");
    }

    const data = await response.json();

    console.log("Datos recibidos del backend:", data);

    // Guardar token en localStorage
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("usuario", data.nombre);
    router.push("/compra"); // Redirige
  } catch (err: any) {
    setError(err.message || "Error en el inicio de sesión");
  }

    try {
      // Simulación de llamada a backend
      const response = await fetch("http://localhost:8000/iniciar-sesion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Usuario o contraseña incorrectos");
      }

      const data = await response.json();
      // Guardar token en localStorage
      localStorage.setItem("token", data.token);
      router.push("/comprar"); // Redirige al home
    } catch (err: any) {
      setError(err.message || "Error en el inicio de sesión");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Iniciar sesión
        </h1>

        {error && (
          <p className="mb-4 text-sm text-red-500 font-medium">{error}</p>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="usuario@ejemplo.com"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="********"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Ingresar
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            ¿No tienes cuenta?{" "}
            <a href="/registrar" className="text-blue-600 hover:underline">
              Crear cuenta
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}