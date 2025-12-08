"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registrarUsuario } from '../services/auth';

export default function RegistrarPage() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      await registrarUsuario({ nombre, email, password });

      router.push('/iniciar-sesion?registro=exitoso');

    } catch (err: any) {

      setError(err.message || "Ocurrió un error inesperado.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
          Crear cuenta
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="nombre"
              className="block text-sm font-medium text-gray-700"
            >
              Nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={cargando}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                ${cargando
                  ? 'bg-pink-300'
                  : 'bg-pink-500 hover:bg-pink-600'
                }
              `}
            >
              {cargando ? 'Registrando...' : 'Registrarme'}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link href="/iniciar-sesion" className="font-medium text-pink-500 hover:text-pink-400">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}