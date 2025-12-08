"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const submit = async (e: any) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/iniciar-sesion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password }),
    });
    if (!res.ok) {
      alert('Login failed');
      return;
    }
    const data = await res.json();
    localStorage.setItem('tp6_token', data.access_token);
    // notify other components and navigate to purchases
    window.dispatchEvent(new Event('tp6:auth-changed'));
    alert('Login OK');
    router.push('/');
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <h2 className="text-2xl font-bold mb-4">Iniciar sesión</h2>
      <form onSubmit={submit} className="space-y-3">
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border rounded" />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full p-2 border rounded" />
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Ingresar</button>
      </form>
    </div>
  );
}
