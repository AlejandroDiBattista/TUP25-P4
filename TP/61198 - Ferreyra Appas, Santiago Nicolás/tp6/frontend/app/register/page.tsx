
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch("/registrar", {
        method: "POST",
        body: JSON.stringify({ nombre, correo, password }),
      });
      router.push("/login");
    } catch (e: any) {
      setError("No se pudo registrar el usuario");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col rounded-xl border bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-xl font-semibold">Crear cuenta</h1>
      {error && (
        <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm">
          Nombre
          <input
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          Correo
          <input
            type="email"
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          Contraseña
          <input
            type="password"
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button
          type="submit"
          className="mt-2 w-full rounded-md bg-indigo-600 py-2 text-sm font-semibold text-white"
        >
          Registrarme
        </button>
      </form>
      <p className="mt-4 text-xs text-slate-600">
        ¿Ya tenés cuenta?{" "}
        <a className="text-indigo-600 hover:underline" href="/login">
          Iniciá sesión
        </a>
      </p>
    </div>
  );
};

export default RegisterPage;
