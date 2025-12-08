import { useState } from 'react'
import Navbar from '../components/Navbar'
import { finalizeCart } from '../lib/api'
import { useCart } from '../context/CartContext'
import { useRouter } from 'next/router'

export default function Cart(){
  const { cart, changeQuantity, removeItem, loadCart } = useCart()
  const [direccion, setDireccion] = useState('')
  const [tarjeta, setTarjeta] = useState('')

  const router = useRouter()

  async function handleFinalize(e){
    e.preventDefault()
    try {
      const res = await finalizeCart({ direccion, tarjeta })
      if(res && res.ok){
        // Redirect to purchase receipt page
        const compraId = res.compra_id || res.compraId || res.id
        await loadCart()
        if (compraId) {
          router.push(`/compras/${compraId}`)
        } else {
          alert(`Compra finalizada. Total: $${(res.total||0).toFixed(2)} (IVA: $${(res.iva_total||0).toFixed(2)}, Envío: $${(res.envio||0).toFixed(2)})`)
          router.push('/')
        }
      } else {
        alert('Error al finalizar')
      }
    } catch (err) {
      console.error('finalize error', err)
      alert('Error al finalizar')
    }
  }

  const items = cart?.items || []
  const subtotal = Number(cart?.subtotal ?? 0)
  const iva = Number(cart?.iva_total ?? 0)
  const envio = Number(cart?.envio ?? 0)
  const total = Number(cart?.total ?? 0)

  return (
    <div>
      <Navbar />
      <main className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Tu carrito</h1>

        <div className="bg-white p-4 rounded shadow">
          {items.length === 0 ? (
            <div>Carrito vacío</div>
          ) : (
            <div>
              {items.map(it=> {
                const prod = it.producto || it.product || {}
                const qty = Number(it.cantidad ?? it.quantity ?? 1)
                const basePrice = Number(prod.precio ?? prod.price ?? 0)
                const category = (prod.categoria || prod.category || '').toString().toLowerCase()
                const ivaRate = (category.includes('electron') || category.includes('electr')) ? 0.10 : 0.21
                const unitWithIva = Math.round((basePrice * (1 + ivaRate)) * 100) / 100
                const lineTotal = Math.round((unitWithIva * qty) * 100) / 100
                const pid = prod.id ?? prod.producto_id
                return (
                  <div key={pid} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <div className="font-semibold">{prod.nombre || prod.titulo || prod.name}</div>
                      <div className="text-sm">${unitWithIva.toFixed(2)} x {qty} = ${lineTotal.toFixed(2)} <span className="ml-2 text-xs text-gray-500">(incl. IVA {Math.round(ivaRate*100)}%)</span></div>
                      <div className="mt-1 flex gap-2">
                        <button type="button" className="px-2 py-1 bg-gray-100 rounded" onClick={()=> changeQuantity(pid, qty - 1)}>-</button>
                        <span className="px-2">{qty}</span>
                        <button type="button" className="px-2 py-1 bg-gray-100 rounded" onClick={()=> changeQuantity(pid, qty + 1)}>+</button>
                        <button type="button" className="px-2 py-1 text-sm text-red-600" onClick={()=> removeItem(pid)}>Eliminar</button>
                      </div>
                    </div>
                    <div>${lineTotal.toFixed(2)}</div>
                  </div>
                )
              })}

              <div className="text-right font-bold mt-4">Total: ${total.toFixed(2)}</div>
              <div className="text-right text-sm mt-2">Subtotal (sin IVA): ${subtotal.toFixed(2)}</div>
              <div className="text-right text-sm">IVA: ${iva.toFixed(2)}</div>
              <div className="text-right text-sm">Envío: ${envio.toFixed(2)}</div>
            </div>
          )}
        </div>

        <form onSubmit={handleFinalize} className="mt-6 max-w-md">
          <label>Dirección</label>
          <input className="w-full border p-2 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" value={direccion} onChange={e=>setDireccion(e.target.value)} />
          <label>Tarjeta</label>
          <input className="w-full border p-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500" value={tarjeta} onChange={e=>setTarjeta(e.target.value)} />
          <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-150">Finalizar compra</button>
        </form>
      </main>
    </div>
  )
}
