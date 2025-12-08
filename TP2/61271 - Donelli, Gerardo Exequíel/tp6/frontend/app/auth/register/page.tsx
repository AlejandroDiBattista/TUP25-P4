'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registrarUsuario } from '@/app/services/auth';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { toast } from 'sonner';
import { Loader2, UserPlus } from 'lucide-react';

export default function RegistroPage() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [cargando, setCargando] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (contraseña.length < 6) {
      toast.error('Contraseña inválida', {
        description: 'La contraseña debe tener al menos 6 caracteres',
      });
      return;
    }

    setCargando(true);

    try {
      const response = await registrarUsuario({ nombre, email, contraseña });
      login(response.access_token);
      toast.success('¡Cuenta creada!', {
        description: 'Tu cuenta ha sido creada exitosamente',
      });
      router.push('/');
    } catch (err) {
      toast.error('Error al registrarse', {
        description: err instanceof Error ? err.message : 'Intenta con otro email',
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
            Crear cuenta
          </CardTitle>
          <CardDescription className="text-center">
            Ingresa tus datos para crear una cuenta nueva
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input
                id="nombre"
                name="nombre"
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Juan Pérez"
              />
            </div>
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
                autoComplete="new-password"
                required
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                placeholder="••••••••"
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 6 caracteres
              </p>
            </div>

            <Button
              type="submit"
              disabled={cargando}
              className="w-full"
            >
              {cargando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Registrarse
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/auth/login" className="font-medium text-primary hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
