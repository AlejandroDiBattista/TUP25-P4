'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";

export function Navbar() {
  const router = useRouter();
  const { usuario, initialLoading, logout } = useAuth();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      try {
        await logout();
      } finally {
        router.push("/iniciar-sesion");
      }
    });
  };

  const authSection = (() => {
    if (initialLoading) {
      return <div className="h-10 w-32 animate-pulse rounded-md bg-slate-200" />;
    }

    if (!usuario) {
      return (
        <div className="flex items-center gap-3 text-sm font-medium">
          <Button asChild variant="ghost" size="sm">
            <Link href="/iniciar-sesion">Ingresar</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/registrar">Crear cuenta</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
        <span className="truncate">{usuario.nombre ?? usuario.email}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={isPending}
        >
          Salir
        </Button>
      </div>
    );
  })();

  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-xl font-semibold tracking-tight text-slate-900">
          TP6 Shop
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href="/" className="transition hover:text-slate-900">
            Productos
          </Link>
          <Link href="/compras" className="transition hover:text-slate-900">
            Mis compras
          </Link>
        </nav>
        {authSection}
      </div>
    </header>
  );
}
