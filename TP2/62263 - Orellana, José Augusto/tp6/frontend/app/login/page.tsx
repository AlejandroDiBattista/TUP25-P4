'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/iniciar-sesion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          contrasenia: password,
        }),
      });

      if (!response.ok) {
        setError('Credenciales inválidas.');
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('Credenciales inválidas.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-md border-slate-200 bg-white shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold text-slate-900">Iniciar sesión</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-600">
                Correo
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="correo@ejemplo.com"
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
                autoComplete="current-password"
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
              {isSubmitting ? 'Ingresando...' : 'Entrar'}
            </Button>

            <p className="text-center text-sm text-slate-500">
              ¿No tienes cuenta?{' '}
              <Link href="/registro" className="font-semibold text-slate-900 hover:underline">
                Registrate
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
