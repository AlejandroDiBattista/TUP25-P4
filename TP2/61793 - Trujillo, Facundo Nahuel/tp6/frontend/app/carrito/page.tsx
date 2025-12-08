"use client"

import { useEffect, useState } from 'react'
import { useToast } from '../components/ToastProvider'
import { obtenerCarrito, quitarProducto, cancelarCarrito } from '../services/carrito'
import { Producto } from '../types'
import Link from 'next/link'

export default function CarritoPage() {
  const [items, setItems] = useState<Array<{ producto: Producto; cantidad: number }>>([])
  const [subtotal, setSubtotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const toast = useToast()

  async function load() {
    setLoading(true)
    try {
      const data = await obtenerCarrito()
      setItems(data.items || [])
      setSubtotal(data.subtotal || 0)
    } catch (e: any) {
      toast.show('No se pudo cargar el carrito: ' + (e?.message || e), 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function onQuitar(productId: number) {
    try {
      await quitarProducto(productId)
      await load()
    } catch (e: any) {
      toast.show('Error quitando producto: ' + (e?.message || e), 'error')
    }
  }

  async function onCancelar() {
    try {
      await cancelarCarrito()
      await load()
      toast.show('Carrito vaciado', 'info')
    } catch (e: any) {
      let msg = 'Error cancelando carrito'
      try {
        const m = String(e?.message || e || '')
        const idx = m.indexOf('{')
        if (idx !== -1) {
          const j = JSON.parse(m.slice(idx))
          if (j && j.detail) msg = String(j.detail)
        } else if (m) {
          msg = m
        }
      } catch (_) {}
      toast.show(msg, 'error')
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Carrito</h1>
      {loading && <p>Cargando...</p>}
      {!loading && items.length === 0 && <p>El carrito está vacío.</p>}
      <div className="space-y-4">
        {items.map((it) => (
          <div key={it.producto.id} className="flex justify-between items-center bg-white p-4 rounded shadow">
            <div>
              <h3 className="font-semibold">{it.producto.nombre}</h3>
              <p className="text-sm text-gray-600">{it.producto.descripcion}</p>
              <p className="text-sm">Cantidad: {it.cantidad}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">${(it.producto.precio * it.cantidad).toFixed(2)}</p>
              <button className="mt-2 text-sm text-red-600" onClick={() => onQuitar(it.producto.id)}>Quitar</button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold">Subtotal: ${subtotal.toFixed(2)}</p>
          {(() => {
            const SHIPPING_FREE_THRESHOLD = 1000
            const SHIPPING_COST = 50
            const envio = subtotal > SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_COST
            const iva = Number((subtotal * 0.21).toFixed(2))
            const total = Number((subtotal + iva + envio).toFixed(2))
            return (
              <p className="text-sm text-gray-600">Total estimado: ${total.toFixed(2)} (Envío: {envio === 0 ? 'Gratis' : `$${envio.toFixed(2)}`})</p>
            )
          })()}
        </div>
        <div className="flex gap-2">
          <button className="bg-gray-200 px-4 py-2 rounded" onClick={onCancelar}>Vaciar carrito</button>
          <Link href="/checkout" className="bg-blue-600 text-white px-4 py-2 rounded">Finalizar compra</Link>
        </div>
      </div>
    </div>
  )
}
