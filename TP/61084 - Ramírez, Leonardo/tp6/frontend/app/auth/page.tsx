'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { registrar, iniciarSesion } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (isRegistering) {
        await registrar(email, password, nombre);
        setSuccess('✅ Registrado correctamente. Ahora inicia sesión.');
        setEmail('');
        setPassword('');
        setNombre('');
        setTimeout(() => {
          setIsRegistering(false);
          setSuccess('');
        }, 2000);
      } else {
        await iniciarSesion(email, password);
        router.push('/');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Error en la autenticación';
      setError(errorMsg);
      console.error('Error de autenticación:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="border border-gray-200 p-10 w-full max-w-md">
        {/* Título */}
        <h1 className="text-2xl font-light mb-2 text-center text-black tracking-tight">
          {isRegistering ? 'Registrarse' : 'Iniciar sesión'}
        </h1>
        <p className="text-center text-gray-500 text-sm mb-8">
          {isRegistering ? 'Crea tu cuenta para comprar' : 'Accede a tu cuenta'}
        </p>

        {/* Mensajes de error y éxito */}
        {error && (
          <div className="mb-6 p-4 border border-black text-black text-sm">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 border border-black text-black text-sm">
            <p>{success}</p>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegistering && (
            <div>
              <label className="block text-sm text-gray-700 mb-2 uppercase tracking-wider">
                Nombre
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                placeholder="Tu nombre completo"
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black text-black placeholder-gray-400 transition text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-700 mb-2 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black text-black placeholder-gray-400 transition text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2 uppercase tracking-wider">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Mínimo 6 caracteres"
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black text-black placeholder-gray-400 transition text-sm"
            />
          </div>

          {/* Botón Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black hover:bg-gray-800 text-white font-normal py-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm uppercase tracking-wider mt-6"
          >
            {isLoading ? (
              <span>Cargando...</span>
            ) : isRegistering ? (
              'Registrarse'
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>

        {/* Toggle entre registro y login */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-600 text-sm mb-3">
            {isRegistering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
          </p>
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
              setSuccess('');
            }}
            className="text-black hover:opacity-70 font-normal text-sm underline transition"
          >
            {isRegistering ? 'Inicia sesión aquí' : 'Regístrate aquí'}
          </button>
        </div>
      </div>
    </div>
  );
}
