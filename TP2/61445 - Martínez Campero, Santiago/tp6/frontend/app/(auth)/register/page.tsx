'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/app/hooks/useToast';
import { registrar } from '@/app/services/auth';

export default function RegisterPage() {
  const router = useRouter();
  const { agregarToast } = useToast();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      const msg = 'Las contraseñas no coinciden';
      setError(msg);
      agregarToast(msg, 'error', 3000);
      return;
    }

    if (password.length < 8) {
      const msg = 'La contraseña debe tener al menos 8 caracteres';
      setError(msg);
      agregarToast(msg, 'error', 3000);
      return;
    }

    setLoading(true);

    try {
      await registrar(nombre || email.split('@')[0], email, password);
      agregarToast('¡Registro exitoso! Redirigiendo...', 'success', 3000);
      router.push('/productos');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error al registrar';
      setError(errorMsg);
      agregarToast(errorMsg, 'error', 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-2">TP6 Shop</h1>
        <h2 className="text-xl font-semibold text-center text-gray-700 mb-6">
          Registrarse
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre (opcional)</Label>
            <Input
              id="nombre"
              type="text"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Mínimo 8 caracteres
            </p>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </Button>
        </form>

        <div className="mt-6 text-center text-gray-600">
          <p>
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
