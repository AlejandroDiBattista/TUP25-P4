"use client"

import { useState } from 'react'
import { finalizarCompra } from '../services/carrito'
import { useRouter } from 'next/navigation'
import { useToast } from '../components/ToastProvider'
import { useEffect } from 'react'
import { useCart } from '../components/CartProvider'

export default function CheckoutPage() {
  const [direccion, setDireccion] = useState('')
  const [tarjeta, setTarjeta] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toast = useToast()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = window.localStorage.getItem('token')
      if (!token) {
        toast.show('Debes iniciar sesión para finalizar la compra', 'info')
        router.push('/login')
      }
    }
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      // evitar enviar si no hay items
      if (items.length === 0) {
        toast.show('No se puede finalizar una compra sin productos', 'error')
        setLoading(false)
        return
      }
      const res = await finalizarCompra({ direccion, tarjeta })
      toast.show('Compra finalizada. ID: ' + (res.compra_id || res.compraId || 'n/a'), 'success')
      router.push('/compras')
    } catch (e: any) {
      toast.show('Error finalizando compra: ' + (e?.message || e), 'error')
    } finally {
      setLoading(false)
    }
  }

  const { items, subtotal, load } = useCart()

  useEffect(() => {
    try { load() } catch (_) {}
  }, [])

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold mb-4">Finalizar compra</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Dirección</label>
          <input className="mt-1 w-full border px-3 py-2 rounded" value={direccion} onChange={e => setDireccion(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Tarjeta</label>
          <input className="mt-1 w-full border px-3 py-2 rounded" value={tarjeta} onChange={e => setTarjeta(e.target.value)} required />
        </div>
        <div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading || items.length === 0}>
            {loading ? 'Procesando...' : 'Pagar'}
          </button>
          {items.length === 0 && <p className="text-sm text-red-600 mt-2">No hay productos en el carrito. Agrega artículos antes de pagar.</p>}
        </div>
      </form>
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Resumen del carrito</h2>
        {items.length === 0 && <p className="text-sm text-gray-600">No hay artículos en el carrito.</p>}
        <div className="space-y-3">
          {items.map(it => (
            <div key={it.producto.id} className="flex items-center gap-3 border p-2 rounded">
              <img src={it.producto.imagen?.startsWith('http') ? it.producto.imagen : `http://localhost:8000/${it.producto.imagen}`} alt={it.producto.nombre} className="w-16 h-12 object-cover rounded" />
              <div className="flex-1">
                <div className="text-sm font-medium">{it.producto.nombre}</div>
                <div className="text-xs text-gray-500">Cantidad: {it.cantidad}</div>
              </div>
              <div className="text-sm font-semibold">${(it.producto.precio * it.cantidad).toFixed(2)}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          {/* Calcular IVA y envío de forma consistente con backend */}
          {(() => {
            const SHIPPING_FREE_THRESHOLD = 1000
            const SHIPPING_COST = 50
            const envio = subtotal > SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_COST
            const iva = Number((subtotal * 0.21).toFixed(2))
            const total = Number((subtotal + iva + envio).toFixed(2))
            return (
              <div className="mt-2">
                <div className="flex justify-between"><span>IVA</span><span>${iva.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Envío</span><span>{envio === 0 ? 'Gratis' : `$${envio.toFixed(2)}`}</span></div>
                <div className="flex justify-between font-semibold mt-2"><span>Total</span><span>${total.toFixed(2)}</span></div>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
