import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../../components/Navbar'
import { fetchCompra } from '../../lib/api'

export default function CompraDetalle(){
  const router = useRouter()
  const { id } = router.query
  const [compra, setCompra] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    if (!id) return
    setLoading(true)
    fetchCompra(id).then(data=>{
      // Backend returns { purchase, items }
      if (data && data.purchase) {
        const p = data.purchase
        p.items = data.items || []
        setCompra(p)
      } else {
        // fallback: API might return the purchase object directly
        setCompra(data)
      }
      setLoading(false)
    }).catch(err=>{ console.error('fetchCompra', err); setLoading(false) })
  }, [id])

  if (loading) return (
    <div>
      <Navbar />
      <main className="container py-8">Cargando comprobante...</main>
    </div>
  )

  if (!compra) return (
    <div>
      <Navbar />
      <main className="container py-8">No se encontró la compra.</main>
    </div>
  )

  const items = compra?.items || []

  return (
    <div>
      <Navbar />
      <main className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Comprobante de compra #{compra.id || id}</h1>
        <div className="bg-white p-4 rounded shadow">
          <div className="mb-4">
              <div><strong>Fecha:</strong> {compra.fecha || compra.created_at || ''}</div>
              <div><strong>Dirección:</strong> {compra.direccion || ''}</div>
              <div><strong>Pago (tarjeta):</strong> {compra.tarjeta ? `**** **** **** ${String(compra.tarjeta).slice(-4)}` : ''}</div>
            </div>

          <table className="w-full text-left">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio unit.</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx)=>{
                const prod = it.producto || it.product || {}
                const cantidad = it.cantidad || it.quantity || it.cant || 1
                const precio = it.precio_unitario ?? prod.precio ?? prod.price ?? it.precio ?? 0
                const nombre = it.nombre || prod.nombre || prod.titulo || prod.name || (prod.nombre ?? prod.title) || `Item ${idx+1}`
                const subtotal = (precio * cantidad)
                return (
                  <tr key={idx} className="border-t">
                    <td className="py-2">{nombre}</td>
                    <td>{cantidad}</td>
                    <td>${Number(precio).toFixed(2)}</td>
                    <td>${Number(subtotal).toFixed(2)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="mt-4 text-right">
            {(() => {
              const subtotal = items.reduce((s, it) => {
                const precio = it.precio_unitario ?? it.precio ?? 0
                const cantidad = it.cantidad ?? it.quantity ?? 0
                return s + (precio * cantidad)
              }, 0)
              const envio = Number(compra.envio ?? 0)
              // IVA computed as total - subtotal - envio when possible
              const total = Number(compra.total ?? compra.grand_total ?? 0)
              const iva = Math.round((total - subtotal - envio) * 100) / 100
              return (
                <>
                  <div>Subtotal: ${Number(subtotal || 0).toFixed(2)}</div>
                  <div>IVA: ${Number(iva || 0).toFixed(2)}</div>
                  <div>Envío: ${Number(envio || 0).toFixed(2)}</div>
                  <div className="font-bold text-lg">Total: ${Number(total || 0).toFixed(2)}</div>
                </>
              )
            })()}
          </div>
        </div>
      </main>
    </div>
  )
}
