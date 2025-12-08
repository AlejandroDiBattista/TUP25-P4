'use client';

import { useState } from 'react';
import { loginUsuario } from '../services/usuarios';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      const data = await loginUsuario(email, password);
      localStorage.setItem('token', data.access_token);
      router.push('/');
    } catch (err) {
      alert('Error al iniciar sesión');
    }
  }

  return (
    <div className="min-h-screen flex justify-center items-center">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-xl font-bold mb-4">Iniciar Sesión</h2>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
          className="w-full border p-2 mb-3 rounded" required />
        <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)}
          className="w-full border p-2 mb-3 rounded" required />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Ingresar</button>
      </form>
    </div>
  );
}
