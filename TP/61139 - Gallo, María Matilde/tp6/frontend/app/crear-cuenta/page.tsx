"use client";
import { useState } from "react";
import { registrar } from "../services/auth";


export default function Registro(){
  const [nombre,setNombre]=useState(""); const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  return (
    <main className="max-w-2xl mx-auto p-6">
      <div className="bg-white border rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-4">Crear cuenta</h1>
        <input className="w-full border rounded-md px-3 py-2 mb-3" placeholder="Nombre" value={nombre} onChange={e=>setNombre(e.target.value)}/>
        <input className="w-full border rounded-md px-3 py-2 mb-3" placeholder="Correo" value={email} onChange={e=>setEmail(e.target.value)}/>
        <input className="w-full border rounded-md px-3 py-2 mb-4" placeholder="Contraseña" type="password" value={password} onChange={e=>setPassword(e.target.value)}/>
        <button className="w-full bg-slate-900 text-white py-2 rounded-md"
          onClick={async()=>{ await registrar(nombre,email,password); location.href="/"; }}>Registrarme</button>
        <p className="mt-3 text-sm">¿Ya tienes cuenta? <a className="underline" href="/ingresar">Inicia sesión</a></p>
      </div>
    </main>
  );
}
