"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const BACK = process.env.NEXT_PUBLIC_BACKEND || "http://127.0.0.1:8000";

export default function LoginForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    if (!email || !password) {
      setError("Completá email y contraseña.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BACK}/iniciar-sesion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();
      let body: any = null;
      try { body = JSON.parse(text); } catch { body = text; }

      if (!res.ok) {
        const msg = body?.detail ?? body?.message ?? body ?? res.statusText;
        throw new Error(String(msg));
      }

      const token = body?.access_token ?? body?.token ?? body?.accessToken ?? null;
      const user = body?.user ?? body?.usuario ?? null;
      if (token) localStorage.setItem("tp_token", token);
      if (user) localStorage.setItem("tp_user", JSON.stringify(user));
      
      // Disparar eventos para actualizar el header y carrito
      window.dispatchEvent(new Event("authChanged"));
      window.dispatchEvent(new Event("cartUpdated"));
      
      // Redirigir al inicio
      window.location.href = "/";
    } catch (err: any) {
      setError(err?.message ?? "Error al iniciar sesión");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Forzar envío si el clic está siendo interceptado
  function handlePointerDown(e: React.PointerEvent) {
    // evita doble envío por eventos nativos si ya se está enviando
    if (loading) return;
    // requestSubmit es preferible porque dispara validación HTML5
    if (formRef.current && (formRef.current as any).requestSubmit) {
      (formRef.current as any).requestSubmit();
    } else if (formRef.current) {
      formRef.current.submit();
    }
  }

  return (
    <form ref={formRef} className="auth-card" onSubmit={handleSubmit} noValidate>
      <h2 className="auth-title">Iniciar sesión</h2>

      <label className="field">
        <div className="field-label">Correo</div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          className="field-input"
          required
        />
      </label>

      <label className="field">
        <div className="field-label">Contraseña</div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="field-input field-input--password"
          required
        />
      </label>

      {error && <div className="field-error">{error}</div>}

      <button
        type="submit"
        className="btn-primary"
        disabled={loading}
        onPointerDown={handlePointerDown}
      >
        {loading ? "Ingresando..." : "Entrar"}
      </button>

      <div className="auth-footer">
        ¿No tenés cuenta? <a className="link" href="/crear-cuenta">Registrate</a>
      </div>
    </form>
  );
}