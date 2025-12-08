"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthProvider"
import { useParams } from "next/navigation"
import Link from "next/link"

type CompraDetalle = {
  id: number
  fecha: string
  direccion: string
  tarjeta: string
  subtotal: number
  iva: number
  envio: number
  total: number
  productos: Array<{
    nombre: string
    precio: number
    cantidad: number
  }>
}

export default function CompraDetallePage() {
  const { usuario, token } = useAuth()
  const params = useParams()
  const compraId = params.id
  const [compra, setCompra] = useState<CompraDetalle | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!usuario || !token || !compraId) return

    fetch(`http://127.0.0.1:8000/compra/${compraId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      }
    })
      .then(res => res.json())
      .then(data => {
        setCompra(data)
        setLoading(false)
      })
      .catch(error => {
        console.error("Error:", error)
        setLoading(false)
      })
  }, [usuario, token, compraId])

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
          <h1 className="text-2xl font-bold">Cargando detalle...</h1>
        </div>
      </div>
    )
  }

  if (!compra) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Compra no encontrada</h1>
          <Link href="/mis-compras" className="text-blue-600 hover:text-blue-800">Volver a mis compras</Link>
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
            <Link href="/mis-compras" className="text-gray-600">Mis compras</Link>
            <span className="text-gray-600">{usuario.nombre}</span>
            <Link href="/" className="text-gray-600 hover:text-gray-900">Salir</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-4">
          <Link href="/mis-compras" className="text-blue-600 hover:text-blue-800 text-sm">
            ← Volver a mis compras
          </Link>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Detalle de la compra</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Lista de compras */}
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-gray-900">Compra #{compra.id}</h3>
              <p className="text-sm text-gray-500">
                {new Date(compra.fecha).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: '2-digit', 
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })} a.m.
              </p>
              <p className="text-sm font-semibold">Total: ${compra.total.toFixed(2)}</p>
            </div>
          </div>

          {/* Información detallada */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Detalle de la compra</h2>
            
            <div className="space-y-3 text-sm mb-6">
              <div>
                <span className="font-medium">Compra #:</span> {compra.id}
              </div>
              <div>
                <span className="font-medium">Fecha:</span> {' '}
                {new Date(compra.fecha).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
                })}, {new Date(compra.fecha).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })} a.m.
              </div>
              <div>
                <span className="font-medium">Dirección:</span> {compra.direccion}
              </div>
            </div>

            <h3 className="text-lg font-medium text-gray-900 mb-4">Productos</h3>
            <div className="space-y-3 mb-6">
              {compra.productos.map((producto, index) => (
                <div key={index}>
                  <h4 className="font-medium text-gray-900">{producto.nombre}</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Cantidad: {producto.cantidad}</span>
                    <div className="text-right">
                      <p className="font-medium">${(producto.precio * producto.cantidad).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">IVA: ${((producto.precio * producto.cantidad) * 0.21).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal: ${compra.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA: ${compra.iva.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío: ${compra.envio.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-2">
                <span>Total pagado: ${compra.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}