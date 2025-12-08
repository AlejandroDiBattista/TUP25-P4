'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { iniciarSesion } from '@/app/services/auth';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { toast } from 'sonner';
import { Loader2, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [cargando, setCargando] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    try {
      const response = await iniciarSesion({ email, contraseña });
      login(response.access_token);
      toast.success('¡Bienvenido!', {
        description: 'Has iniciado sesión correctamente',
      });
      router.push('/');
    } catch (err) {
      toast.error('Error al iniciar sesión', {
        description: err instanceof Error ? err.message : 'Verifica tus credenciales',
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Iniciar sesión
          </CardTitle>
          <CardDescription className="text-center">
            Ingresa tus credenciales para acceder a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={cargando}
              className="w-full"
            >
              {cargando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Iniciar sesión
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              ¿No tienes una cuenta?{' '}
              <Link href="/auth/register" className="font-medium text-primary hover:underline">
                Regístrate aquí
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
