'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function RegistroPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);

    const trimmedName = nombre.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

    if (!trimmedName) {
      setError('El nombre es obligatorio.');
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      setError('Ingresa un correo válido.');
      return;
    }

    if (trimmedPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/registrar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: trimmedName,
          email: trimmedEmail,
          contrasenia: trimmedPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message = data?.detail ?? 'No se pudo crear la cuenta. Intenta nuevamente.';
        throw new Error(message);
      }

      router.push('/login');
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? submissionError.message : 'Ocurrió un error inesperado.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-md border-slate-200 bg-white shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold text-slate-900">Crear cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-slate-600">
                Nombre
              </Label>
              <Input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                placeholder="Juan Perez"
                autoComplete="name"
                required
                className="h-12 rounded-lg border-slate-200 text-slate-700 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-600">
                Correo
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="jperez@mail.com"
                autoComplete="email"
                required
                className="h-12 rounded-lg border-slate-200 text-slate-700 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-600">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                required
                className="h-12 rounded-lg border-slate-200 text-slate-700"
              />
            </div>

            {error ? <p className="text-sm text-red-500">{error}</p> : null}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full rounded-lg bg-slate-900 text-sm font-semibold text-white hover:bg-slate-900/90"
            >
              {isSubmitting ? 'Creando cuenta...' : 'Registrarme'}
            </Button>

            <p className="text-center text-sm text-slate-500">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="font-semibold text-slate-900 hover:underline">
                Inicia sesión
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
