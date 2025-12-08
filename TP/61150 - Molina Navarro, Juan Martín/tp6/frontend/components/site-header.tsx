"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  AUTH_USER_UPDATED_EVENT,
  notifyUsuarioUpdated,
  readUsuarioFromStorage,
  type Usuario,
} from "@/lib/auth";
import { cn } from "@/lib/utils";

type HeaderProps = {
  active?: "products" | "login" | "register" | "orders";
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const navLinkClasses = (isActive: boolean) =>
  cn(
    "text-sm transition",
    isActive ? "font-semibold text-slate-900" : "text-slate-500 hover:text-slate-900"
  );

export function SiteHeader({ active = "products" }: HeaderProps) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isClosingSession, setIsClosingSession] = useState(false);

  useEffect(() => {
    const syncUsuario = () => setUsuario(readUsuarioFromStorage());
    syncUsuario();

    window.addEventListener("storage", syncUsuario);
    window.addEventListener(AUTH_USER_UPDATED_EVENT, syncUsuario as EventListener);

    return () => {
      window.removeEventListener("storage", syncUsuario);
      window.removeEventListener(AUTH_USER_UPDATED_EVENT, syncUsuario as EventListener);
    };
  }, []);

  const handleLogout = async () => {
    if (typeof window === "undefined" || isClosingSession) {
      return;
    }

    setIsClosingSession(true);
    const token = window.localStorage.getItem("token");

    try {
      if (token) {
        const response = await fetch(`${API_BASE_URL}/cerrar-sesion`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.detail ?? "No se pudo cerrar la sesion");
        }
      }
    } catch (error) {
      console.error("Error al cerrar sesion", error);
    } finally {
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("usuario");
      setUsuario(null);
      notifyUsuarioUpdated();
      setIsClosingSession(false);
    }
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6">
        <span className="text-xl font-semibold tracking-tight text-slate-900">TP6 Shop</span>
        <nav className="flex items-center gap-6">
          <Link className={navLinkClasses(active === "products")} href="/">
            Productos
          </Link>
          {usuario && (
            <Link className={navLinkClasses(active === "orders")} href="/compras">
              Mis compras
            </Link>
          )}
          {usuario ? (
            <span className="text-sm font-semibold text-slate-600">{usuario.nombre}</span>
          ) : (
            <Link className={navLinkClasses(active === "login")} href="/login">
              Ingresar
            </Link>
          )}
          {usuario ? (
            <Button
              onClick={handleLogout}
              disabled={isClosingSession}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              variant="ghost"
            >
              {isClosingSession ? "Cerrando..." : "Cerrar sesion"}
            </Button>
          ) : (
            <Button
              asChild
              className={cn(
                "rounded-full border border-slate-900 px-5 py-2 text-sm font-medium transition",
                active === "register"
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "bg-white text-slate-900 hover:bg-slate-900 hover:text-white"
              )}
            >
              <Link href="/register">Crear cuenta</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
