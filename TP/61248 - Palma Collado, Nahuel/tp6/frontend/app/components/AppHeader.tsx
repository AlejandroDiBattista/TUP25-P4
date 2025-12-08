'use client';

import Link from 'next/link';
import { useAuth } from '../providers/AuthProvider';

interface AppHeaderProps {
  onOpenCart?: () => void;
}

export default function AppHeader({ onOpenCart }: AppHeaderProps) {
  const { usuario, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-blue-600">
          <span className="rounded-full bg-blue-100 px-2 py-1 text-sm font-semibold text-blue-600">TP6</span>
          ShopNow
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/" className="transition hover:text-blue-600">
            Productos
          </Link>
          <Link href="/checkout" className="transition hover:text-blue-600">
            Checkout
          </Link>
          <Link href="/orders" className="transition hover:text-blue-600">
            Compras
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {usuario ? (
            <>
              <div className="text-right text-xs">
                <p className="font-semibold text-slate-700">{usuario.nombre}</p>
                <p className="text-slate-500">{usuario.email}</p>
              </div>
              <button
                onClick={logout}
                className="rounded-lg border border-slate-300 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-800"
              >
                Cerrar sesión
              </button>
              {onOpenCart && (
                <button
                  onClick={onOpenCart}
                  className="rounded-lg bg-blue-600 px-3 py-1 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Carrito
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:border-blue-300"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Registrarme
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
