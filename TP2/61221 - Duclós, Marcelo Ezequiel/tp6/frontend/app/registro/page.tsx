'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegistroPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    contraseña: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validaciones básicas
    if (formData.contraseña.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }
    
    if (!/[A-Za-z]/.test(formData.contraseña)) {
      setError('La contraseña debe contener al menos una letra');
      setLoading(false);
      return;
    }
    
    if (!/[0-9]/.test(formData.contraseña)) {
      setError('La contraseña debe contener al menos un número');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/registrar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Error al registrar usuario');
      }
    } catch (err) {
      setError('Error al conectar con el servidor. Intenta de nuevo.');
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

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                ¡Registro exitoso!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Tu cuenta ha sido creada. Redirigiendo al login...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Crear cuenta
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="nombre" className="block text-sm font-bold text-gray-900 mb-2">
                Nombre
              </label>
              <div className="mt-1">
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border-2 border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                  placeholder="Juan Pérez"
                />
              </div>
            </div>

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
                  placeholder="juan@email.com"
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
                  autoComplete="new-password"
                  required
                  value={formData.contraseña}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border-2 border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                  placeholder="Mínimo 6 caracteres"
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
                {loading ? 'Registrando...' : 'Registrarme'}
              </button>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Inicia sesión
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}