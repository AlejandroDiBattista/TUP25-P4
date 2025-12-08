'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { iniciarSesion, registrarUsuario } from '../services/auth';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Datos del formulario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        await iniciarSesion({ email, password });
        setSuccess('¡Inicio de sesión exitoso!');
        setTimeout(() => router.push('/'), 1000);
      } else {
        // Registro
        await registrarUsuario({ nombre, email, password });
        setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
        // Cambiar a modo login
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-200 flex items-center justify-center p-4">
      <div className="card-surface w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h1>
          <p className="text-gray-600">
            {isLogin
              ? '¡Bienvenido de nuevo!'
              : '¡Únete a nosotros hoy!'}
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre (solo en registro) */}
          {!isLogin && (
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre completo
              </label>
              <input
                id="nombre"
                type="text"
                required={!isLogin}
                minLength={3}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="input-field"
                placeholder="Juan Pérez"
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="tu@email.com"
            />
          </div>

          {/* Contraseña */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          {/* Mensajes de error/éxito */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {/* Botón submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 disabled:opacity-60"
          >
            {loading
              ? 'Cargando...'
              : isLogin
              ? 'Iniciar Sesión'
              : 'Crear Cuenta'}
          </button>
        </form>

        {/* Toggle entre login y registro */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
            }}
            className="btn-link"
          >
            {isLogin
              ? '¿No tienes cuenta? Regístrate'
              : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>

        {/* Link para volver */}
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="btn-link"
          >
            ← Volver al catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
