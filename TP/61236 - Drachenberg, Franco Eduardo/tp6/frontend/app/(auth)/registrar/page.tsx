'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { useAuth } from '@/app/context/AuthContext';

export default function RegistrarPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    try {
      await register({ nombre, email, password });
      setSuccessMessage('Cuenta creada correctamente. Ahora puedes iniciar sesión.');
      setTimeout(() => router.push('/iniciar-sesion'), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar la cuenta');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Crear cuenta</CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Completa los datos para registrarte y comenzar a comprar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                required
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                placeholder="Juan Pérez"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nombre@correo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm font-medium text-red-600">{error}</p>}
            {successMessage && <p className="text-sm font-medium text-emerald-600">{successMessage}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Registrando...' : 'Registrarme'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">
            ¿Ya tienes cuenta?{' '}
            <Link href="/iniciar-sesion" className="font-medium text-slate-900 hover:underline">
              Inicia sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
