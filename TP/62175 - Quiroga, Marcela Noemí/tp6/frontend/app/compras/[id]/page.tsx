'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ItemCompra {
  id: number
  producto_id: number
  cantidad: number
  nombre: string
  precio_unitario: number
}

interface Compra {
  id: number
  fecha: string
  direccion: string
  tarjeta: string
  total: number
  envio: number
  items: ItemCompra[]
}

export default function DetalleCompraPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [compra, setCompra] = useState<Compra | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (params.id) {
      cargarCompra(Number(params.id))
    }
  }, [isAuthenticated, router, params.id])

  const cargarCompra = async (id: number) => {
    try {
      setLoading(true)
      const response = await api.get(`/api/compras/${id}`)
      setCompra(response.data)
    } catch (error: any) {
      if (error.response?.status === 404) {
        alert('Compra no encontrada')
        router.push('/compras')
      } else {
        alert('Error al cargar la compra')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  if (!compra) {
    return null
  }

  const subtotal = compra.items.reduce((sum, item) => {
    return sum + item.precio_unitario * item.cantidad
  }, 0)
  const iva = compra.total - subtotal - compra.envio

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/compras">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Compras
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Detalle de Compra #{compra.id}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {compra.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start border-b pb-4">
                      <div>
                        <p className="font-semibold">{item.nombre}</p>
                        <p className="text-sm text-gray-500">
                          Cantidad: {item.cantidad} x ${item.precio_unitario.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold">
                        ${(item.precio_unitario * item.cantidad).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Información de Envío</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{compra.direccion}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Tarjeta: ****{compra.tarjeta.slice(-4)}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA:</span>
                  <span>${iva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío:</span>
                  <span>${compra.envio.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${compra.total.toFixed(2)}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Fecha: {new Date(compra.fecha).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

