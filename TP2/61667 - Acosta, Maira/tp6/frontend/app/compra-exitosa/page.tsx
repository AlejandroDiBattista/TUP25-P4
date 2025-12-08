"use client"

import Link from "next/link"
import { useAuth } from "../contexts/AuthProvider"

export default function CompraExitosaPage() {
  const { usuario } = useAuth()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <Link href="/" className="text-lg font-semibold text-gray-900">TP6 Shop</Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/" className="text-gray-600">Productos</Link>
            <span className="text-gray-600">Mis compras</span>
            <span className="text-gray-600">{usuario?.nombre}</span>
            <Link href="/" className="text-gray-600 hover:text-gray-900">Salir</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">¡Compra realizada!</h1>
          <p className="text-gray-600">Tu pedido ha sido procesado exitosamente</p>
        </div>

        <div className="space-y-4">
          <Link 
            href="/"
            className="inline-block bg-gray-900 text-white py-3 px-6 rounded font-medium hover:bg-gray-800"
          >
            Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  )
}