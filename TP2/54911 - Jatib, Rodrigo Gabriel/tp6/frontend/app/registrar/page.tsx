"use client";
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function RegisterPage() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async (e: any) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/registrar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password }),
    });
    if (!res.ok) {
      alert('Registro falló');
      return;
    }
    const data = await res.json();
    localStorage.setItem('tp6_token', data.access_token);
    alert('Registro OK');
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <h2 className="text-2xl font-bold mb-4">Registrarse</h2>
      <form onSubmit={submit} className="space-y-3">
        <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" className="w-full p-2 border rounded" />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border rounded" />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full p-2 border rounded" />
        <button className="px-4 py-2 bg-green-600 text-white rounded">Crear cuenta</button>
      </form>
    </div>
  );
}
