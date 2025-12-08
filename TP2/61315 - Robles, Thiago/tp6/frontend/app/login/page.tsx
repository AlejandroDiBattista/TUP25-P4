"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { iniciarSesion } from "../services/auth";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function LoginPage() {
  
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const contraseña = formData.get("contraseña") as string;

    if (!email || !contraseña) return;
    try {
      await iniciarSesion({email, contraseña});
      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "Has iniciado sesión correctamente",
      }).then(() => {
        router.push("/");
      });
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo iniciar sesión",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Inicia sesión</CardTitle>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contraseña">Contraseña</Label>
              <Input
                id="contraseña"
                name="contraseña"
                type="password"
                required
                placeholder="••••••••"
              />
            </div>
            <Button className="w-full" type="submit">
              Entrar
            </Button>
          </CardContent>
        </form>
        <CardFooter className="flex justify-center gap-1 text-sm text-muted-foreground">
          <span>¿No tienes cuenta?</span>
          <Link
            href="/registro"
            className="font-medium text-primary hover:underline"
          >
            Regístrate
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
