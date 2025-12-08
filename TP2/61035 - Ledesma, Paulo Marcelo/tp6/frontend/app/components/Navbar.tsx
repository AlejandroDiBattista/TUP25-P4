"use client";
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';

export default function Navbar() {
  const { isLogged, userName } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('tp6_token');
    localStorage.removeItem('tp6_user');
    window.dispatchEvent(new CustomEvent('authChanged'));
    window.location.href = '/';
  };

  return (
    <nav className="w-full bg-yellow-400/70 backdrop-blur-md shadow-md sticky top-0 z-50 flex justify-between items-center px-6 py-4">
      <div className="text-xl font-semibold text-black">🛒Punto Central</div>

      <div className="flex gap-6 items-center">
        {isLogged ? (
          <>
            <span className="text-sm font-semibold text-black">¡Hola, {userName}!</span>
            <Link href="/" className="text-black hover:text-yellow-700 transition">Inicio</Link>
            <Link href="/compras" className="text-black hover:text-yellow-700 transition">Mis compras</Link>
            <button onClick={handleLogout} className="text-black hover:text-yellow-700 font-semibold transition">Cerrar sesión</button>
          </>
        ) : (
          <>
            <Link href="/" className="text-black hover:text-yellow-700 transition">Inicio</Link>
            <Link href="/login" className="text-black hover:text-yellow-700 transition">Ingresar</Link>
            <Link href="/registrar" className="text-black hover:text-yellow-700 transition">Crear usuario</Link>
          </>
        )}
      </div>
    </nav>
  );
}

