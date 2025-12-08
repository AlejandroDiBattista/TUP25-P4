"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const NavBar = dynamic(() => import("../components/NavBar"), { ssr: false });

export default function RegisterPage() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const registerRes = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, password })
    });
    
    if (!registerRes.ok) {
      alert("Error al registrarse");
      return;
    }
    
    const loginRes = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    
    if (loginRes.ok) {
      const data = await loginRes.json();
      localStorage.setItem("usuario", JSON.stringify({ 
        nombre: data.nombre, 
        email: data.email, 
        access_token: data.access_token 
      }));
      window.dispatchEvent(new Event('storage'));
      router.push("/");
    } else {
      alert("Registro exitoso, por favor inicie sesión");
      router.push("/login");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="flex items-center justify-center py-16">
        <form className="bg-white p-8 rounded shadow-md w-full max-w-md" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold mb-6 text-center">Crear cuenta</h2>
          <label className="block mb-2 text-base font-semibold text-gray-700">Nombre</label>
          <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full mb-5 px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition" placeholder="Nombre" required />
          <label className="block mb-2 text-base font-semibold text-gray-700">Correo</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mb-5 px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition" placeholder="Correo" required />
          <label className="block mb-2 text-base font-semibold text-gray-700">Contraseña</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full mb-7 px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition" placeholder="Contraseña" required />
          <button type="submit" className="w-full bg-blue-700 text-white py-3 rounded-xl font-bold border border-blue-700 shadow hover:bg-transparent hover:text-blue-700 transition active:scale-95">Registrarme</button>
          <div className="mt-6 text-center text-base">
            ¿Ya tienes cuenta? <a href="/login" className="text-blue-600 font-semibold hover:underline">Inicia sesión</a>
          </div>
        </form>
      </div>
    </div>
  );
}
