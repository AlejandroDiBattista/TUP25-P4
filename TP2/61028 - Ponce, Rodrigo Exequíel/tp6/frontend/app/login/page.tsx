"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from '../context/AuthContext'; // <-- ¡1. IMPORTAMOS EL CEREBRO!

// (Importaciones de shadcn/ui)
import { Button } from '../../components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/card';
import { Input } from '../../components/input';
import { Label } from '../../components/label';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth(); // <-- 2. OBTENEMOS LA FUNCIÓN 'login' DEL CEREBRO

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formBody = new URLSearchParams();
    formBody.append('username', email);
    formBody.append('password', password);

    try {
      const response = await fetch("http://localhost:8000/iniciar-sesion", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formBody,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Email o contraseña incorrectos");
      }
      
      // --- 3. ¡LA CORRECCIÓN! ---
      // Ya no usamos localStorage.setItem() aquí.
      // Usamos la función del "cerebro", que hace AMBAS cosas:
      // 1. Guarda el token en el estado.
      // 2. Guarda el token en localStorage.
      login(data.access_token); 
      // --- FIN DE LA CORRECCIÓN ---

      router.push("/"); 

    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error");
    }
  };

  // ... (El resto de tu 'return' JSX es idéntico y está perfecto)
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa tu email y contraseña para acceder a tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm font-medium text-red-500">{error}</p>
            )}
            <Button type="submit" className="w-full">
              Ingresar
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-sm">
          <p className="text-muted-foreground">
            ¿No tienes una cuenta?{" "}
            <Link
              href="/registrar"
              className="font-medium text-primary hover:underline"
            >
              Regístrate
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}