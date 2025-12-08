"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { notifyUsuarioUpdated } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Status =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState<Status>({ type: "idle" });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus({ type: "loading" });

    try {
      const response = await fetch(`${API_BASE_URL}/iniciar-sesion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail ?? "Error al iniciar sesión");
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      notifyUsuarioUpdated();

      setStatus({
        type: "success",
        message: `Bienvenido/a ${data.usuario.nombre}!`,
      });
      router.push("/");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ocurrió un error inesperado";
      setStatus({ type: "error", message });
    }
  };

  const isSubmitting = status.type === "loading";

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <SiteHeader active="login" />
      <main className="mx-auto flex max-w-5xl justify-center px-6 py-16">
        <Card className="w-full max-w-md border border-slate-200 bg-white p-8 shadow-[0px_20px_50px_rgba(15,23,42,0.06)]">
          <CardHeader className="space-y-2 p-0">
            <CardTitle className="text-2xl font-semibold text-slate-900">
              Iniciar sesión
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 p-0 pt-6">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Correo</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              {status.type === "error" && (
                <p className="text-sm text-red-600">{status.message}</p>
              )}
              {status.type === "success" && (
                <p className="text-sm text-emerald-600">{status.message}</p>
              )}
              <Button
                className="w-full bg-slate-900 text-white hover:bg-slate-800"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Ingresando..." : "Entrar"}
              </Button>
            </form>
            <p className="text-center text-sm text-slate-500">
              ¿No tienes cuenta?{" "}
              <Link
                href="/register"
                className="font-semibold text-slate-900 hover:underline"
              >
                Regístrate
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
