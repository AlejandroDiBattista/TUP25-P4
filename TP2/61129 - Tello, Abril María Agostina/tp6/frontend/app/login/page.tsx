

"use client";

import { useState } from "react";
import NavBar from "../components/NavBar";
import { useRouter } from "next/navigation";

type ErrorState = {
  email?: string;
  password?: string;
  general?: string;
};


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<ErrorState>({});
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError({});
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("usuario", JSON.stringify({ 
        nombre: data.nombre, 
        email: data.email, 
        access_token: data.access_token 
      }));
      window.dispatchEvent(new Event('storage'));
      router.push("/");
    } else {
      let errorMsg = "Error al iniciar sesión";
      let errorState: ErrorState = {};
      try {
        const error = await res.json();
        if (typeof error === "string") {
          errorMsg = error;
        } else if (error.detail) {
          errorMsg = error.detail;
        }
      } catch {}
      if (res.status === 404) {
        errorState.email = "Usuario no registrado";
      } else if (res.status === 401) {
        errorState.password = "Contraseña incorrecta";
      } else {
        errorState.general = errorMsg;
      }
      setError(errorState);
    }
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="flex items-center justify-center py-16">
        <form className="bg-white p-8 rounded shadow-md w-full max-w-md" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold mb-6 text-center">Iniciar sesión</h2>
          <label className="block mb-2 text-base font-semibold text-gray-700">Correo</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mb-2 px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition" placeholder="Correo" required />
          {error.email && (
            <div className="mb-4 text-left text-red-600 font-bold">{error.email}</div>
          )}
          <label className="block mb-2 text-base font-semibold text-gray-700">Contraseña</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full mb-2 px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition" placeholder="Contraseña" required />
          {error.password && (
            <div className="mb-4 text-left text-red-600 font-bold">{error.password}</div>
          )}
          {error.general && (
            <div className="mb-4 text-center text-red-600 font-bold">{error.general}</div>
          )}
          <button type="submit" className="w-full bg-blue-700 text-white py-3 rounded-xl font-bold border border-blue-700 shadow hover:bg-transparent hover:text-blue-700 transition active:scale-95">Entrar</button>
          <div className="mt-6 text-center text-base">
            ¿No tienes cuenta? <a href="/register" className="text-blue-600 font-semibold hover:underline">Regístrate</a>
          </div>
        </form>
      </div>
    </div>
  );
}
