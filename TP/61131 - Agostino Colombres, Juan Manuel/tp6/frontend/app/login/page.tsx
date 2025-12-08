"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { iniciarSesion, registrarUsuario } from "../services/auth";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (mode === "register") {
        await registrarUsuario({ nombre, email, password });
        setSuccessMessage("Registro exitoso. Iniciando sesión...");
      }

      const tokenResponse = await iniciarSesion({ email, password });
      if (typeof window !== "undefined") {
        localStorage.setItem("token", tokenResponse.access_token);
        localStorage.setItem("usuarioNombre", tokenResponse.nombre);

        
        window.location.href = "/";
        return;
      }
      router.push("/");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocurrió un error inesperado");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
          {mode === "login" ? "Iniciar sesión" : "Crear una cuenta"}
        </h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "register" && (
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-900">
                Nombre completo
              </label>
              <input
                id="nombre"
                type="text"
                required
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-900">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
          >
            {loading
              ? "Procesando..."
              : mode === "login"
              ? "Iniciar sesión"
              : "Registrarse"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-800">
          {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button
            type="button"
            onClick={toggleMode}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            {mode === "login" ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>

        <p className="mt-4 text-center text-sm text-gray-700">
          <Link href="/" className="text-blue-600 hover:text-blue-500">
            Volver al catálogo
          </Link>
        </p>
      </div>
    </div>
  );
}
