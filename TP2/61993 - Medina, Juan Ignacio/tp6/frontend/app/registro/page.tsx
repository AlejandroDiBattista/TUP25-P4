'use client';

import { useState } from 'react';
import { registrarUsuario } from '../services/usuarios';
import { useRouter } from 'next/navigation';

export default function RegistroPage() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  async function handleRegistro(e: React.FormEvent) {
    e.preventDefault();
    try {
      await registrarUsuario(nombre, email, password);
      alert('Usuario registrado correctamente');
      router.push('/login');
    } catch {
      alert('Error al registrar usuario');
    }
  }

  return (
    <div className="min-h-screen flex justify-center items-center">
      <form onSubmit={handleRegistro} className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-xl font-bold mb-4">Registrar Usuario</h2>
        <input type="text" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)}
          className="w-full border p-2 mb-3 rounded" required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
          className="w-full border p-2 mb-3 rounded" required />
        <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)}
          className="w-full border p-2 mb-3 rounded" required />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Registrar</button>
      </form>
    </div>
  );
}
