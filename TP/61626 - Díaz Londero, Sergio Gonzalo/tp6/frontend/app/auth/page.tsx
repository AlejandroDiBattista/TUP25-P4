'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { login, register } from '@/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Verificar si viene el parámetro register
    const registerParam = searchParams.get('register');
    if (registerParam === 'true') {
      setIsLogin(false);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        const data = await login(email, password);
        localStorage.setItem('token', data.access_token);
        // Guardar información del usuario
        localStorage.setItem('user', JSON.stringify({ email, nombre: nombre || email.split('@')[0] }));
        router.push('/productos');
        router.refresh(); // Forzar actualización del componente
      } else {
        await register(nombre, email, password);
        // Después de registrar, iniciar sesión automáticamente
        const data = await login(email, password);
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify({ email, nombre }));
        router.push('/productos');
        router.refresh(); // Forzar actualización del componente
        return;
      }
    } catch (error) {
      setError('Error en la autenticación. Por favor, intente nuevamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin 
              ? 'Ingresa tus credenciales para acceder' 
              : 'Completa el formulario para registrarte'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre completo"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            {error && (
              <div className="text-sm text-destructive text-center font-medium">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full">
              {isLogin ? 'Iniciar sesión' : 'Registrarse'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            type="button"
            variant="link"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}