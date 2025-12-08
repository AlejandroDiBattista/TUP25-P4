"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import { registrarUsuario } from "../services/auth";
import { useRouter } from "next/navigation";

export default function RegistroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);


  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const nombre = (fd.get("nombre") as string) ?? "";
    const correo = (fd.get("correo") as string) ?? "";
    const password = (fd.get("password") as string) ?? "";
    try {
      if (!nombre || !correo || !password) {
        throw new Error("Completa todos los campos");
      }
      await registrarUsuario({
        nombre,
        email: correo,
        contraseña: password,
      });
      Swal.fire({
        icon: "success",
        title: "Cuenta creada",
        text: "Bienvenido!",
      }).then(() => router.push("/login"));
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: (err as Error).message || "Fallo registro",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Registro</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                name="nombre"
                placeholder="Juan Pérez"
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="correo">Correo</Label>
              <Input
                id="correo"
                name="correo"
                type="email"
                placeholder="correo@ejemplo.com"
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
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creando..." : "Crear cuenta"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center text-sm">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="ml-2 font-semibold text-primary underline-offset-4 hover:underline"
          >
            Inicia sesión
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
