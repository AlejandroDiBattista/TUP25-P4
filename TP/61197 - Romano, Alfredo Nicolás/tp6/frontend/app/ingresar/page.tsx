"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../services/auth";

export default function IngresarPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      await login(email, password);
      // login() guarda el token en localStorage
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="bg-white border rounded p-6">
        <h2 className="text-2xl font-semibold mb-4">Iniciar sesión</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col">
            <span className="text-sm">Correo</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="border rounded px-3 py-2" />
          </label>
          <label className="flex flex-col">
            <span className="text-sm">Contraseña</span>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="border rounded px-3 py-2" />
          </label>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button className="bg-slate-900 text-white px-4 py-2 rounded" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
