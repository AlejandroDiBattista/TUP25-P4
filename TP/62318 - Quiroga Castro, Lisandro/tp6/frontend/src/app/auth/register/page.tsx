// src/app/auth/register/page.tsx
"use client";
import { useState } from "react";
import { registrarUsuario } from "@/services/api";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await registrarUsuario({ nombre, email, contraseña });
      if (res.usuario) {
        alert("Registrado correctamente. Iniciá sesión.");
        router.push("/auth/login");
      } else {
        alert(res.detail || "Error al registrar");
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || "Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Crear cuenta</h1>

      <form onSubmit={submit} style={{ marginTop: 18 }}>
        <label style={{ display: "block", marginBottom: 8, color: "#444" }}>
          Nombre
        </label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Tu nombre"
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.08)",
            marginBottom: 12,
          }}
        />

        <label style={{ display: "block", marginBottom: 8, color: "#444" }}>
          Email
        </label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@ejemplo.com"
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.08)",
            marginBottom: 12,
          }}
        />

        <label style={{ display: "block", marginBottom: 8, color: "#444" }}>
          Contraseña
        </label>
        <input
          value={contraseña}
          onChange={(e) => setContraseña(e.target.value)}
          type="password"
          placeholder="Contraseña"
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.08)",
            marginBottom: 12,
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            background: "#007aff",
            color: "#fff",
            border: "none",
            fontWeight: 600,
          }}
        >
          {loading ? "Registrando..." : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}
//
