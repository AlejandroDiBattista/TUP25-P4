"use client";
import { useState } from 'react';
import { setToken } from '../services/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
 

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new URLSearchParams();
      form.set('username', email);
      form.set('password', password);
      const res = await fetch(`${API_URL}/iniciar-sesion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      });
      if (!res.ok) throw new Error('Credenciales inválidas');
      const data = await res.json();
      setToken(data.access_token);
      try {
        const ok = await fetch(`${API_URL}/me`, { headers: { Authorization: `Bearer ${data.access_token}` } });
        if (!ok.ok) throw new Error('Token inválido tras login');
      } catch {
        setToken(null);
        throw new Error('No se pudo validar la sesión. Intenta nuevamente.');
      }
      window.location.replace('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-start justify-center pt-10 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm border rounded-md p-6 bg-white flex flex-col gap-4 shadow-sm">
        <h1 className="text-xl font-semibold mb-1">Iniciar sesión</h1>
  <input className="border px-3 py-2 rounded" placeholder="Email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
  <input className="border px-3 py-2 rounded" placeholder="Contraseña" type="password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
        <button disabled={loading} className="bg-gray-900 hover:bg-black text-white rounded px-4 py-2 text-sm font-medium">
          {loading ? 'Ingresando...' : 'Entrar'}
        </button>
        <p className="text-xs text-gray-500">¿No tienes cuenta? <a href="/register" className="underline">Regístrate</a></p>
      </form>
    </div>
  );
}
