'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import Link from 'next/link';

export default function Header() {
  const { usuario, isAutenticado, cerrarSesion } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await cerrarSesion();
    router.push('/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <h1 className="text-2xl font-bold text-gray-900 cursor-pointer">Venti Indumentaria</h1>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="text-gray-700 hover:text-gray-900 transition font-bold">
            Productos
          </Link>

          {isAutenticado ? (
            <>
              <Link href="/compras" className="text-gray-700 hover:text-gray-900 transition">
                Mis compras
              </Link>
              <span className="text-gray-700">
                {usuario?.nombre}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-gray-900 transition cursor-pointer font-bold"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link href="/auth?tab=login" className="text-gray-700 hover:text-gray-900 transition font-bold">
                Ingresar
              </Link>
              <Link href="/auth?tab=registro" className="text-gray-700 hover:text-gray-900 transition font-bold">
                Crear cuenta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
