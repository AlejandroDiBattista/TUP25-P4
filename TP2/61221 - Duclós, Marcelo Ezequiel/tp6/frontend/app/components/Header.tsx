'use client'

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';

export default function Header() {
  const { usuario, logout, isAuthenticated } = useAuth();
  const { totalItems } = useCarrito();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-gray-900">
            TP6 Shop
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Productos
            </Link>
            
            {isAuthenticated && (
              <>
                <Link 
                  href="/compras" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Mis compras
                </Link>
                
                <Link 
                  href="/carrito" 
                  className="relative text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Carrito
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </>
            )}
          </nav>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  {usuario?.nombre}
                </span>
                <button
                  onClick={logout}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/login" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Ingresar
                </Link>
                <Link 
                  href="/registro" 
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Crear cuenta
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden mt-4">
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-gray-900"
            >
              Productos
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  href="/compras" 
                  className="text-gray-600 hover:text-gray-900"
                >
                  Mis compras
                </Link>
                <Link 
                  href="/carrito" 
                  className="text-gray-600 hover:text-gray-900"
                >
                  Carrito ({totalItems})
                </Link>
                <span className="text-gray-700">{usuario?.nombre}</span>
                <button
                  onClick={logout}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-gray-600 hover:text-gray-900"
                >
                  Ingresar
                </Link>
                <Link 
                  href="/registro" 
                  className="text-gray-600 hover:text-gray-900"
                >
                  Crear cuenta
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}