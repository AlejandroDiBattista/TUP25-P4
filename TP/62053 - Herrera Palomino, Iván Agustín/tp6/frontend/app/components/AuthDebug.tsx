"use client";

import React, { useState } from "react";

const BACK = process.env.NEXT_PUBLIC_BACKEND || "http://127.0.0.1:8000";

export default function AuthDebug() {
  const [out, setOut] = useState<string | null>(null);

  async function doRegister() {
    setOut(null);
    const payload = { email: "debug_user@example.com", password: "DebugPass123", nombre: "Debug" };
    console.log("DEBUG register ->", BACK + "/registrar", payload);
    try {
      const res = await fetch(`${BACK}/registrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      console.log("DEBUG register response", res.status, text);
      setOut(`Registro: ${res.status}\n${text}`);
    } catch (err) {
      console.error("DEBUG register error", err);
      setOut(`Registro error: ${String(err)}`);
    }
  }

  async function doLogin() {
    setOut(null);
    const payload = { email: "debug_user@example.com", password: "DebugPass123" };
    console.log("DEBUG login ->", BACK + "/iniciar-sesion", payload);
    try {
      const res = await fetch(`${BACK}/iniciar-sesion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      console.log("DEBUG login response", res.status, text);
      setOut(`Login: ${res.status}\n${text}`);
    } catch (err) {
      console.error("DEBUG login error", err);
      setOut(`Login error: ${String(err)}`);
    }
  }

  return (
    <section className="auth-debug">
      <h4 className="auth-debug-title">Depuración Auth</h4>
      <div className="auth-debug-buttons">
        <button onClick={doRegister} className="btn-debug">Probar registro (debug)</button>
        <button onClick={doLogin} className="btn-debug">Probar login (debug)</button>
      </div>
      <div className="auth-debug-output">{out || "(Sin resultados aún)"}</div>
      <div className="auth-debug-backend">Backend: {BACK}</div>
    </section>
  );
}