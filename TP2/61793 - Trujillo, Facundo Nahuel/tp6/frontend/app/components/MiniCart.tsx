"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { obtenerCarrito, agregarAlCarrito, quitarProducto, cancelarCarrito } from '../services/carrito'
import { useCart } from './CartProvider'
import { Producto } from '../types'
import { useToast } from './ToastProvider'

export default function MiniCart() {
  const { items, subtotal, load, add, remove, clear } = useCart()
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  useEffect(() => {
    // load cart once if token present
    if (typeof window === 'undefined') return
    const token = window.localStorage.getItem('token')
    if (!token) return
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const router = useRouter()

  async function onAdd(productId: number) {
    try {
    const prod = (items as any[]).find((i: any) => i.producto.id === productId)?.producto
      if (!prod) return
      await add(prod, 1)
      toast.show('Se agregó una unidad', 'success')
    } catch (e: any) {
      toast.show('Error agregando: ' + (e?.message || e), 'error')
    }
  }

  async function onRemove(productId: number) {
    try {
      await remove(productId)
      toast.show('Producto eliminado del carrito', 'info')
    } catch (e: any) {
      toast.show('Error eliminando: ' + (e?.message || e), 'error')
    }
  }

  async function onVaciar() {
    try {
      await clear()
      toast.show('Carrito vaciado', 'info')
    } catch (e: any) {
      // formatear mensaje de error si el backend devolvió JSON {detail: ...}
      let msg = 'Error vaciando carrito'
      try {
        const m = String(e?.message || e || '')
        const idx = m.indexOf('{')
        if (idx !== -1) {
          const j = JSON.parse(m.slice(idx))
          if (j && j.detail) msg = String(j.detail)
        } else if (m) {
          msg = m
        }
      } catch (_) {
        // fallback
      }
      toast.show(msg, 'error')
    }
  }

  // Reglas de envío en cliente: gratis si subtotal > SHIPPING_FREE_THRESHOLD
  const SHIPPING_FREE_THRESHOLD = 1000
  const SHIPPING_COST = 50
  const envio = subtotal > SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_COST
  const iva = Number((subtotal * 0.21).toFixed(2))
  const total = Number((subtotal + iva + envio).toFixed(2))

  return (
    <div className="bg-white rounded-lg border p-4 space-y-4">
      <h3 className="font-semibold text-lg">Resumen</h3>
  {loading && <p>Cargando...</p>}

      <div className="space-y-3">
  {(items as any[]).map((it: any) => (
          <div key={it.producto.id} className="flex items-center gap-3 border p-2 rounded">
            <img src={it.producto.imagen?.startsWith('http') ? it.producto.imagen : `http://localhost:8000/${it.producto.imagen}`} alt={it.producto.nombre} className="w-16 h-12 object-cover rounded" />
            <div className="flex-1">
              <div className="text-sm font-medium">{it.producto.nombre}</div>
              <div className="text-xs text-gray-500">${(it.producto.precio).toFixed(2)} c/u</div>
              <div className="text-xs text-gray-500 mt-1">Cantidad: {it.cantidad}</div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="text-sm font-semibold">${(it.producto.precio * it.cantidad).toFixed(2)}</div>
              <div className="flex gap-1">
                <button className="px-2 py-1 border rounded" onClick={() => onRemove(it.producto.id)}>-</button>
                <button className="px-2 py-1 border rounded" onClick={() => onAdd(it.producto.id)}>+</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t"></div>
      <div className="text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>IVA</span><span>${iva.toFixed(2)}</span></div>
  <div className="flex justify-between"><span>Envío</span><span>{envio === 0 ? 'Gratis' : `$${envio.toFixed(2)}`}</span></div>
        <div className="flex justify-between font-semibold mt-2"><span>Total</span><span>${total.toFixed(2)}</span></div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 bg-white border px-4 py-2 rounded" onClick={onVaciar}>Cancelar</button>
        <button
          className="flex-1 bg-[#0b1726] text-white px-4 py-2 rounded"
          onClick={() => {
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null
            if (!token) {
              toast.show('Inicia sesión para continuar con la compra', 'info')
              return
            }
            router.push('/checkout')
          }}
        >
          Continuar compra
        </button>
      </div>
    </div>
  )
}
