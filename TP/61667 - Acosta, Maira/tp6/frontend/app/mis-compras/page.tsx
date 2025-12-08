"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthProvider"
import Link from "next/link"

type Compra = {
  id: number
  fecha: string
  total: number
  direccion: string
  productos: Array<{
    nombre: string
    precio: number
    cantidad: number
  }>
}

export default function MisComprasPage() {
  const { usuario, token } = useAuth()
  const [compras, setCompras] = useState<Compra[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!usuario || !token) return

    fetch("http://127.0.0.1:8000/mis-compras", {
      headers: {
        "Authorization": `Bearer ${token}`,
      }
    })
      .then(res => res.json())
      .then(data => {
        setCompras(data)
        setLoading(false)
      })
      .catch(error => {
        console.error("Error:", error)
        setLoading(false)
      })
  }, [usuario, token])

  if (!usuario) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Acceso no autorizado</h1>
          <Link href="/login" className="text-blue-600 hover:text-blue-800">Iniciar sesión</Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Cargando compras...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <Link href="/" className="text-lg font-semibold text-gray-900">TP6 Shop</Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/" className="text-gray-600">Productos</Link>
            <span className="text-gray-600">Mis compras</span>
            <span className="text-gray-600">{usuario.nombre}</span>
            <Link href="/" className="text-gray-600 hover:text-gray-900">Salir</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Mis compras</h1>
        
        {compras.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No tienes compras realizadas</p>
            <Link href="/" className="bg-gray-900 text-white py-2 px-4 rounded hover:bg-gray-800">
              Ir a comprar
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {compras.map((compra) => (
              <div key={compra.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">Compra #{compra.id}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(compra.fecha).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">Total: ${compra.total.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-3">
                  <p>Productos: {compra.productos.map(p => `${p.nombre} (${p.cantidad})`).join(', ')}</p>
                </div>
                
                <Link 
                  href={`/compra/${compra.id}`}
                  className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200"
                >
                  Ver detalle
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}