"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { obtenerCompraPorId } from '../../services/compras'
import { useToast } from '../../components/ToastProvider'
import { Compra } from '../../types'
import Link from 'next/link'

export default function CompraDetailPage() {
  const params = useParams()
  const id = params?.id

  const [compra, setCompra] = useState<Compra | null>(null)
  const [loading, setLoading] = useState(false)

  const toast = useToast()

  async function load() {
    if (!id) return
    setLoading(true)
    try {
      const data = await obtenerCompraPorId(Number(id))
      setCompra(data)
    } catch (e: any) {
      toast.show('Error cargando compra: ' + (e?.message || e), 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  if (loading) return <p>Cargando...</p>
  if (!compra) return <p>Compra no encontrada.</p>

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Detalle Compra #{compra.id}</h1>
      <p className="text-sm text-gray-600">Fecha: {new Date((compra.fecha || 0) * 1000).toLocaleString()}</p>
      <p className="mt-2">Dirección: {compra.direccion}</p>
      <p>Envio: ${compra.envio.toFixed(2)}</p>
      <p className="font-semibold">Total: ${compra.total.toFixed(2)}</p>

      <h2 className="text-lg font-semibold mt-4">Items</h2>
      <div className="space-y-2 mt-2">
        {(compra.items || []).map(it => (
          <div key={it.producto_id} className="flex justify-between bg-white p-3 rounded shadow">
            <div>
              <p className="font-semibold">{it.nombre}</p>
              <p className="text-sm text-gray-600">Cantidad: {it.cantidad}</p>
            </div>
            <div className="text-right">
              <p>${(it.precio_unitario * it.cantidad).toFixed(2)}</p>
              <p className="text-sm text-gray-500">${it.precio_unitario.toFixed(2)} c/u</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Link href="/compras" className="text-blue-600">← Volver al historial</Link>
      </div>
    </div>
  )
}
