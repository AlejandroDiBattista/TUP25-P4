"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// --- ¡RUTAS RELATIVAS CORREGIDAS! ---
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
// --- FIN DE LA CORRECCIÓN ---

export default function RegistrarPage() {
  // ... (el resto de tu archivo es idéntico y está perfecto) ...
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/registrar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Error al intentar registrarse");
      }

      router.push("/login");

    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
          <CardDescription>
            Ingresa tus datos para registrarte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                placeholder="Tu Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
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
              Crear Cuenta
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-sm">
          <p className="text-muted-foreground">
            ¿Ya tienes una cuenta?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Inicia Sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}