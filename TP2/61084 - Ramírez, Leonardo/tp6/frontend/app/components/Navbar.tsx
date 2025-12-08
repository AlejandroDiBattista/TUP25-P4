'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';

export function Navbar() {
  const { usuario, cerrarSesion } = useAuth();
  const { items } = useCarrito();
  const cantidadCarrito = items.reduce((sum: number, item: any) => sum + item.cantidad, 0);

  const handleCerrarSesion = async () => {
    await cerrarSesion();
    window.location.href = '/';
  };

  return (
    <nav className="bg-black text-white border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-medium tracking-tight hover:opacity-70 transition-opacity">
          E-Commerce
        </Link>

        <div className="flex gap-6 items-center text-sm">
          {usuario ? (
            <>
              <span className="text-gray-300">{usuario.email}</span>
              <Link href="/carrito" className="hover:opacity-70 transition-opacity">
                Carrito ({cantidadCarrito})
              </Link>
              <Link href="/compras" className="hover:opacity-70 transition-opacity">
                Mis compras
              </Link>
              <button
                onClick={handleCerrarSesion}
                className="border border-white hover:bg-white hover:text-black px-4 py-1.5 transition-colors"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link href="/auth" className="border border-white hover:bg-white hover:text-black px-4 py-1.5 transition-colors">
                Iniciar sesión
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
