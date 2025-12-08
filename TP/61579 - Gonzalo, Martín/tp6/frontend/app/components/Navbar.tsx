'use client';

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useCarrito } from '../contexts/CarritoContext';

export default function Navbar() {
  const { usuario, estaLogueado, cerrarSesion, cargando } = useAuth();
  const { items } = useCarrito();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo / Título */}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          🛍️ Tienda online TP6
        </Link>

        {/* Centro - Navegación */}
        <div className="flex gap-6 items-center">
          {estaLogueado && (
            <>
              <Link
                href="/productos"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Productos
              </Link>
              <Link
                href="/mis-compras"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Mis Compras
              </Link>
            </>
          )}
        </div>

        {/* Derecha - Carrito y Auth */}
        <div className="flex gap-4 items-center">
          {estaLogueado && (
            <Link
              href="/carrito"
              className="relative hover:text-blue-600 transition text-2xl"
            >
              🛒
              {items.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>
          )}

          {!cargando && (
            <>
              {estaLogueado ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-700">
                    {usuario?.nombre}
                  </span>
                  <button
                    onClick={cerrarSesion}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/registro"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
