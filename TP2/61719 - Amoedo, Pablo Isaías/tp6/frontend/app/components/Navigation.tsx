'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context';
import { api } from '@/lib/api';

export default function Navigation() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post('/cerrar-sesion');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
    logout();
    router.push('/Login');
  };

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-white shadow">
      <Link href="/" className="text-xl font-bold text-gray-800">
        TP6 Shop
      </Link>
      <div className="flex gap-4 text-sm text-gray-600">
        <Link href="/productos" className="hover:text-gray-800">Productos</Link>
        {isAuthenticated ? (
          <>
            <Link href="/compras" className="hover:text-gray-800">Mis compras</Link>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-800 font-semibold"
            >
              Salir
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="font-semibold hover:text-gray-800">Ingresar</Link>
            <Link href="/registro" className="hover:text-gray-800">Crear cuenta</Link>
          </>
        )}
      </div>
    </nav>
  );
}
