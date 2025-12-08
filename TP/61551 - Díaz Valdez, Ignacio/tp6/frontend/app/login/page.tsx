"use client";
import { useState, FormEvent } from 'react';
import { loginUser } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null); setCargando(true);
    try {
      await loginUser(email, password);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('flash', 'Se ha iniciado sesión');
        window.location.href = '/';
      }
    } catch (err: any) {
      setError(err?.message || 'Error');
    } finally { setCargando(false); }
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Iniciar sesión</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <input className="border p-2 w-full rounded-md" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
            <input className="border p-2 w-full rounded-md" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={cargando}>{cargando? 'Ingresando...' : 'Ingresar'}</Button>
          </form>
          <p className="text-sm mt-4">¿No tenés cuenta? <a className="text-indigo-600 underline" href="/register">Registrate</a></p>
        </CardContent>
      </Card>
    </div>
  );
}
