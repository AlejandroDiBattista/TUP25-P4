"use client";

import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, signOut, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  function handleSignOut() {
    signOut();
    router.push('/login');
  }

  return (
    <nav className="bg-white border-b shadow-sm px-4 py-2 flex items-center justify-between">
  <div className="font-bold text-lg text-gray-900">TP6 Shop</div>
      <div className="flex items-center gap-4">
        <Link href="/productos" className="text-blue-900 font-semibold px-3 py-1 rounded hover:bg-blue-100 transition">Productos</Link>
        {loading ? (
          <span className="text-gray-500 text-sm">Cargando...</span>
        ) : isAuthenticated ? (
          <>
            <Link href="/compras" className="text-blue-900 font-semibold px-3 py-1 rounded hover:bg-blue-100 transition">Mis compras</Link>
            <span className="text-gray-700 font-semibold">{user?.nombre}</span>
            <button onClick={handleSignOut} className="bg-blue-900 text-white px-3 py-1 rounded hover:bg-blue-700 transition font-semibold">Salir</button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-blue-900 font-semibold px-3 py-1 rounded hover:bg-blue-100 transition">Ingresar</Link>
            <Link href="/register" className="bg-blue-900 text-white px-3 py-1 rounded hover:bg-blue-700 transition font-semibold">Crear cuenta</Link>
          </>
        )}
      </div>
    </nav>
  );
}
