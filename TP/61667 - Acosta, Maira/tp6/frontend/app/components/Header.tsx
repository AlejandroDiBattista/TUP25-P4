"use client"

import { useAuth } from "@/contexts/AuthProvider"
import Link from "next/link"

export default function Header() {
  const { usuario, logout } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-gray-900">
          TP6 Shop
        </Link>
        
        <nav className="flex items-center space-x-6">
          <Link href="/productos" className="text-gray-600 hover:text-gray-900">
            Productos
          </Link>
          
          {usuario ? (
            <>
              <Link href="/carrito" className="text-gray-600 hover:text-gray-900">
                Mis compras
              </Link>
              <span className="text-gray-600">{usuario.nombre}</span>
              <button
                onClick={logout}
                className="text-gray-600 hover:text-gray-900"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Iniciar sesión
              </Link>
              <Link href="/register" className="text-gray-600 hover:text-gray-900">
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
