"use client";
import { useState } from "react";
import { login } from ".././services/auth";

export default function Ingresar(){
  const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  return (
    <main className="max-w-2xl mx-auto p-6">
      <div className="bg-white border rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-4">Iniciar sesión</h1>
        <input className="w-full border rounded-md px-3 py-2 mb-3" placeholder="Correo" value={email} onChange={e=>setEmail(e.target.value)}/>
        <input className="w-full border rounded-md px-3 py-2 mb-4" placeholder="Contraseña" type="password" value={password} onChange={e=>setPassword(e.target.value)}/>
        <button className="w-full bg-slate-900 text-white py-2 rounded-md"
          onClick={async()=>{ await login(email,password); location.href="/"; }}>Entrar</button>
        <p className="mt-3 text-sm">¿No tienes cuenta? <a className="underline" href="/crear-cuenta">Regístrate</a></p>
      </div>
    </main>
  );
}
