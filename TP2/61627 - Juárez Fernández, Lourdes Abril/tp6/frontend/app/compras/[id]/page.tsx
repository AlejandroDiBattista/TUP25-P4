"use client"
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ItemCompra {
  producto_id: number
  cantidad: number
  nombre: string
  precio_unitario: number
}

interface CompraDetalle {
  id: number
  fecha: number
  total: number
  envio: number
  direccion?: string
  tarjeta?: string
  items: ItemCompra[]
}

export default function CompraDetallePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [compra, setCompra] = useState<CompraDetalle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) { router.push('/ingresar'); return }
    const fetchData = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/compras/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.status === 401) { router.push('/ingresar'); return }
        if (!res.ok) throw new Error('No se pudo obtener el detalle')
        const data = await res.json()
        setCompra(data)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar detalle')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [params.id, router])

  if (loading) return <p className="text-gray-600">Cargando...</p>
  if (error) return <p className="text-red-600">{error}</p>
  if (!compra) return <p className="text-gray-600">No se encontró la compra.</p>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Detalle de compra #{compra.id}</h1>

      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Fecha: {new Date(compra.fecha * 1000).toLocaleString()}</span>
            <span>Total: ${compra.total.toFixed(2)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-700 mb-4">Envío: {compra.envio === 0 ? 'Gratis' : `$${compra.envio.toFixed(2)}`}</div>
          {compra.direccion && <div className="text-sm text-gray-700 mb-4">Dirección: {compra.direccion}</div>}
          {compra.tarjeta && <div className="text-sm text-gray-700 mb-4">Tarjeta: {compra.tarjeta}</div>}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Producto</th>
                  <th className="py-2">Cantidad</th>
                  <th className="py-2">Precio unitario</th>
                  <th className="py-2">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {compra.items.map((it, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-2">{it.nombre}</td>
                    <td className="py-2">{it.cantidad}</td>
                    <td className="py-2">${it.precio_unitario.toFixed(2)}</td>
                    <td className="py-2">${(it.precio_unitario * it.cantidad).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
