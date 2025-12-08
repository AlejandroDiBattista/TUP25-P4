'use client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login() {
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // NUEVO: detectar si ya hay sesión para no romper el login “normal”
  const [hasToken, setHasToken] = useState(false);
  const [nombreLS, setNombreLS] = useState<string | null>(null);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    setHasToken(!!t);
    setNombreLS(typeof window !== 'undefined' ? localStorage.getItem('usuario_nombre') : null);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') || '');
    const password = String(form.get('password') || '');
    try {
      const res = await fetch(`${API}/iniciar-sesion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error(await res.text().catch(() => 'Credenciales inválidas'));
      const data = await res.json();
      if (data.access_token) localStorage.setItem('token', data.access_token);
      const nombre = data?.user?.nombre || data?.usuario?.nombre || data?.nombre || null;
      if (nombre) localStorage.setItem('usuario_nombre', String(nombre));
      toast.success('Inicio de sesión exitoso');
      router.replace('/');
    } catch (err: any) {
      toast.error(err?.message || 'No se pudo iniciar sesión');
    }
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario_nombre');
    setHasToken(false);
    setNombreLS(null);
    toast.success('Sesión cerrada', { duration: 1200 });
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-background to-muted/40 p-4">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
          <CardDescription>Accedé para continuar</CardDescription>
        </CardHeader>

        {/* Si ya hay token, no redirigimos: damos opciones y no “rompe” el login */}
        {hasToken ? (
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Ya iniciaste sesión{nombreLS ? ` como ${nombreLS}` : ''}.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={() => router.push('/')}>Ir al inicio</Button>
              <Button variant="destructive" onClick={logout}>Cerrar sesión</Button>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
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
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {err && <p className="text-sm text-red-600">{err}</p>}
            </CardContent>

            <div className="mx-6 border-t" />

            <CardFooter className="flex flex-col gap-4 pt-6">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Ingresando...' : 'Entrar'}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                ¿No tenés cuenta? <a href="/auth/registro" className="underline">Registrate</a>
              </p>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}