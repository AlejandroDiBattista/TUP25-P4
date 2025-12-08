"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthProvider"
import { useCart } from "../contexts/CartProvider"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function CheckoutPage() {
  const { usuario, token } = useAuth()
  const { productos, subtotal, iva, envio, total, limpiarCarrito } = useCart()
  const [direccion, setDireccion] = useState("")
  const [tarjeta, setTarjeta] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!usuario) {
      router.push("/login")
      return
    }
    if (productos.length === 0) {
      router.push("/")
      return
    }
  }, [usuario, productos, router])

  const handleConfirmarCompra = async () => {
    if (!direccion.trim() || !tarjeta.trim()) {
      alert("Por favor complete todos los campos")
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch("http://127.0.0.1:8000/finalizar-compra", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Bearer ${token}`,
        },
        body: new URLSearchParams({
          direccion,
          tarjeta,
          productos_carrito: JSON.stringify(productos)
        })
      })

      if (response.ok) {
        limpiarCarrito()
        router.push("/compra-exitosa")
      } else {
        alert("Error al procesar la compra")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error de conexión")
    }
    
    setLoading(false)
  }

  if (!usuario || productos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Cargando...</h1>
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
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Finalizar compra</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resumen del carrito */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Resumen del carrito</h2>
            
            <div className="space-y-4">
              {productos.map((producto) => (
                <div key={producto.id} className="flex justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{producto.nombre}</h3>
                    <p className="text-sm text-gray-500">Cantidad: {producto.cantidad}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(producto.precio * producto.cantidad).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">c/u ${producto.precio.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total productos: ${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>IVA: ${iva.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Envío: ${envio.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-2">
                <span>Total a pagar: ${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Datos de envío */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Datos de envío</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  id="direccion"
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder=""
                />
              </div>

              <div>
                <label htmlFor="tarjeta" className="block text-sm font-medium text-gray-700 mb-1">
                  Tarjeta
                </label>
                <input
                  id="tarjeta"
                  type="text"
                  value={tarjeta}
                  onChange={(e) => setTarjeta(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="1234-5678-9012-3456"
                />
              </div>

              <button
                onClick={handleConfirmarCompra}
                disabled={loading}
                className="w-full bg-gray-900 text-white py-3 px-4 rounded font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? "Procesando..." : "Confirmar compra"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}