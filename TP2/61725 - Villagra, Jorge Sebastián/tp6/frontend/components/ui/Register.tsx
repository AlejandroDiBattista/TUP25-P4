'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Register() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password }),
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(msg || 'No se pudo registrar');
      }
      localStorage.setItem('usuario_nombre', nombre);
      toast.success('Registro exitoso, ahora podés iniciar sesión');
      router.push('/auth/login');
    } catch (err: any) {
      toast.error(err?.message || 'Error en el registro');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-background to-muted/40 p-4">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Crear cuenta</CardTitle>
          <CardDescription>Registrate para continuar tu compra</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                name="nombre"            // <-- requerido para FormData (si lo usaras) y accesibilidad
                placeholder="Tu nombre"
                autoComplete="name"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"             // <-- requerido
                type="email"
                placeholder="tu@email.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"          // <-- requerido
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={4}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">Mínimo 4 caracteres.</p>
            </div>
          </CardContent>

          <div className="mx-6 border-t" />

          <CardFooter className="flex flex-col gap-4 pt-6">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creando...' : 'Crear cuenta'}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              ¿Ya tenés cuenta? <a className="underline" href="/auth/login">Iniciá sesión</a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}