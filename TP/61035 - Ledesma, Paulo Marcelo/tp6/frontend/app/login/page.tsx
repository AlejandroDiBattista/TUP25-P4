"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/iniciar-sesion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || "Credenciales inválidas");
      }

      const data = await res.json();
      const token = data.access_token || data.token || null;
      if (!token) throw new Error("Respuesta inválida del servidor");

      localStorage.setItem("tp6_token", token);
      if (data.user) localStorage.setItem("tp6_user", JSON.stringify(data.user));

      // Disparar evento personalizado para actualizar componentes en la misma ventana
      window.dispatchEvent(new CustomEvent('authChanged'));

      router.push("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-white">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-semibold text-sky-700 text-center mb-4">Iniciar sesión</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@ejemplo.com"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Contraseña</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </Button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-4">
          ¿No tenés cuenta? <a href="/registrar" className="text-sky-600 font-semibold">Crear cuenta</a>
        </p>
      </div>
    </div>
  );
}
