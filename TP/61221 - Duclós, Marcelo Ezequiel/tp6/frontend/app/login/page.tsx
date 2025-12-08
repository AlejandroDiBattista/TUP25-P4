'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    contraseña: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await login(formData.email, formData.contraseña);
      if (success) {
        router.push('/');
      } else {
        setError('Credenciales inválidas. Verifica tu email y contraseña.');
      }
    } catch (err) {
      setError('Error al iniciar sesión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Iniciar sesión
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-2">
                Correo
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border-2 border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contraseña" className="block text-sm font-bold text-gray-900 mb-2">
                Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="contraseña"
                  name="contraseña"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.contraseña}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border-2 border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                  placeholder="********"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                ¿No tienes cuenta?{' '}
                <Link href="/registro" className="font-medium text-blue-600 hover:text-blue-500">
                  Regístrate
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}