"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function RegisterPage() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password })
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.detail || 'Error al registrar');
      }
      alert('Registro exitoso, ahora inicia sesión');
      router.push('/login');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado';
      alert(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-start justify-center pt-10 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm border rounded-md p-6 bg-white flex flex-col gap-4 shadow-sm">
        <h1 className="text-xl font-semibold mb-1">Crear cuenta</h1>
        <input className="border px-3 py-2 rounded" placeholder="Nombre" value={nombre} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)} />
        <input className="border px-3 py-2 rounded" placeholder="Email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
        <input className="border px-3 py-2 rounded" placeholder="Contraseña" type="password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
        <button disabled={loading} className="bg-gray-900 hover:bg-black text-white rounded px-4 py-2 text-sm font-medium">
          {loading ? 'Registrando...' : 'Registrarme'}
        </button>
        <p className="text-xs text-gray-500">¿Ya tienes cuenta? <a href="/login" className="underline">Inicia sesión</a></p>
      </form>
    </div>
  );
}
