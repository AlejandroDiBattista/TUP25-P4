import React from 'react'
import { useRouter } from 'next/router'
import { useCart } from '../context/CartContext'

export default function CartWidget() {
  const router = useRouter()
  const { cart, addItem, removeItem, changeQuantity } = useCart()
  const { items = [], subtotal = 0, iva_total = 0, envio = 0, total = 0, loading } = cart

  if (loading) return <div className="p-4">Cargando carrito...</div>

  const empty = !items || items.length === 0

  return (
    <aside className="w-full md:w-96 p-4 bg-white rounded shadow">
      <h4 className="font-semibold mb-2">Carrito</h4>
      {empty ? (
        <div className="text-sm text-gray-600">El carrito está vacío</div>
      ) : (
        <div>
          <ul className="space-y-3 max-h-72 overflow-auto">
            {items.map((it) => {
              const prod = it.producto || it.product || {}
              const qty = Number(it.cantidad ?? it.quantity ?? 1)
              const basePrice = Number(prod.precio ?? prod.price ?? 0)
              const category = (prod.categoria || prod.category || '').toString().toLowerCase()
              const ivaRate = (category.includes('electron') || category.includes('electr')) ? 0.10 : 0.21
              const unitWithIva = Math.round((basePrice * (1 + ivaRate)) * 100) / 100
              const lineTotal = Math.round((unitWithIva * qty) * 100) / 100
              const pid = prod.id ?? prod.producto_id
              return (
                <li key={pid} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{prod.nombre || prod.titulo || prod.name}</div>
                    <div className="text-sm text-gray-600">${unitWithIva.toFixed(2)} x {qty} = ${lineTotal.toFixed(2)} <span className="ml-2 text-xs text-gray-500">(incl. IVA {Math.round(ivaRate*100)}%)</span></div>
                    <div className="mt-1 flex gap-2">
                      <button className="px-2 py-1 bg-gray-100 rounded" onClick={() => changeQuantity(pid, qty - 1)}>-</button>
                      <span className="px-2">{qty}</span>
                      <button className="px-2 py-1 bg-gray-100 rounded" onClick={() => changeQuantity(pid, qty + 1)}>+</button>
                      <button className="px-2 py-1 text-sm text-red-600" onClick={() => removeItem(pid)}>Eliminar</button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="mt-4">
            <div className="flex justify-between"><span>Subtotal (sin IVA)</span><strong>${subtotal.toFixed(2)}</strong></div>
            <div className="flex justify-between"><span>IVA</span><strong>${iva_total.toFixed(2)}</strong></div>
            <div className="flex justify-between"><span>Envío</span><strong>${envio.toFixed(2)}</strong></div>
            <div className="flex justify-between mt-2 text-lg"><span>Total</span><strong>${total.toFixed(2)}</strong></div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => router.push('/cart')}
              disabled={empty}
              className={`w-full px-4 py-2 rounded-lg text-white ${empty ? 'bg-emerald-400 opacity-60 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
              Finalizar compra
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
