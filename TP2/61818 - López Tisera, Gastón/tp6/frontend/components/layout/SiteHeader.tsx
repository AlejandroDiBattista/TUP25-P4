'use client';

import Link from "next/link";

import { useAuth } from "@/hooks/useAuth";

export function SiteHeader(): JSX.Element {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="text-lg font-bold text-slate-900">
          TP6 Shop
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/"
            className="text-slate-600 transition hover:text-slate-900"
          >
            Productos
          </Link>
          {user && (
            <>
              <Link
                href="/compras"
                className="text-slate-600 transition hover:text-slate-900"
              >
                Mis compras
              </Link>
              <span className="text-slate-900">{user.nombre}</span>
              <button
                type="button"
                onClick={logout}
                className="text-slate-600 transition hover:text-slate-900"
              >
                Salir
              </button>
            </>
          )}
          {!user && (
            <>
              <Link
                href="/auth/login"
                className="text-slate-600 transition hover:text-slate-900"
              >
                Ingresar
              </Link>
              <Link
                href="/auth/register"
                className="text-slate-900 transition hover:text-slate-700"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

