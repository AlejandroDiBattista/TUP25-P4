"use client";
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';

export default function Navbar() {
  const { isLogged, userName } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('tp6_token');
    localStorage.removeItem('tp6_user');
    // Disparar evento personalizado para actualizar componentes en la misma ventana
    window.dispatchEvent(new CustomEvent('authChanged'));
    window.location.href = '/';
  };

  return (
    <nav className="w-full bg-gradient-to-r from-sky-700 to-sky-600 shadow-md sticky top-0 z-50 flex justify-between items-center px-6 py-4">
      <div className="text-xl font-semibold text-white">🛍️ De Todo Un Poco</div>

      <div className="flex gap-6 items-center">
        {isLogged ? (
          <>
            <span className="text-sm font-semibold text-white">¡Hola, {userName}!</span>
            <Link href="/" className="text-white hover:text-sky-100 transition">Inicio</Link>
            <Link href="/compras" className="text-white hover:text-sky-100 transition">Mis compras</Link>
            <button onClick={handleLogout} className="text-white hover:text-sky-100 font-semibold transition">Cerrar sesión</button>
          </>
        ) : (
          <>
            <Link href="/" className="text-white hover:text-sky-100 transition">Inicio</Link>
            <Link href="/login" className="text-white hover:text-sky-100 transition">Ingresar</Link>
            <Link href="/registrar" className="text-white hover:text-sky-100 transition">Crear usuario</Link>
          </>
        )}
      </div>
    </nav>
  );
}