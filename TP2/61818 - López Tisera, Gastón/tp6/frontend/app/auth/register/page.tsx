/*
  Pantalla de registro de usuario
*/

'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AuthCard } from "@/components/forms/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage(): JSX.Element {
  const router = useRouter();
  const { register, loading, error, user } = useAuth();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    try {
      await register({ nombre, email, password });
      router.push("/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo completar el registro.";
      setFormError(message);
    }
  };

  return (
    <AuthCard
      title="Crear cuenta"
      subtitle="Completá tus datos para registrarte."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre completo</Label>
          <Input
            id="nombre"
            type="text"
            required
            placeholder="Juan Pérez"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="nombre@correo.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={6}
          />
        </div>

        {(error || formError) && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError ?? error}
          </p>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creando cuenta..." : "Registrarme"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        ¿Ya tenés cuenta?{" "}
        <Link className="font-semibold text-slate-900 hover:underline" href="/auth/login">
          Iniciá sesión
        </Link>
      </p>
    </AuthCard>
  );
}

