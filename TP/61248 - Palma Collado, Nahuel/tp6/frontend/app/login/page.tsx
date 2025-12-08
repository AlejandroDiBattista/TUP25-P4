'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import AppHeader from '../components/AppHeader';
import { useAuth } from '../providers/AuthProvider';

export default function LoginPage() {
  const router = useRouter();
  const { login, cargando } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      console.error(err);
      const mensaje = err instanceof Error ? err.message : 'No se pudo iniciar sesión. Verificá tus datos e intentá nuevamente.';
      setError(mensaje);
    } finally {
      setPending(false);
    }
  };

  const disabled = cargando || pending;

  return (
    <div className="min-h-screen bg-slate-100">
      <AppHeader />

      <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12">
        <div className="rounded-xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-slate-500">
            Accedé a tu cuenta para continuar con tus compras.
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="tu@email.com"
                required
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Contraseña
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="********"
                required
                minLength={8}
              />
            </label>

            <button
              type="submit"
              disabled={disabled}
              className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {pending ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            ¿Todavía no tenés cuenta?{' '}
            <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700">
              Registrate acá
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
