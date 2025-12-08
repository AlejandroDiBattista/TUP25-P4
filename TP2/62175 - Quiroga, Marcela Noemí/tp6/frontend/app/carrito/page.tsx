'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ItemCarrito {
  id: number
  producto_id: number
  cantidad: number
  producto: {
    id: number
    nombre: string
    descripcion: string
    precio: number
    categoria: string
    existencia: number
  }
}

interface Carrito {
  id: number
  estado: string
  items: ItemCarrito[]
}

export default function CarritoPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [carrito, setCarrito] = useState<Carrito | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    cargarCarrito()
  }, [isAuthenticated, router])

  const cargarCarrito = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/carrito')
      setCarrito(response.data)
    } catch (error) {
      console.error('Error al cargar carrito:', error)
    } finally {
      setLoading(false)
    }
  }

  const quitarProducto = async (productoId: number) => {
    try {
      await api.delete(`/api/carrito/${productoId}`)
      cargarCarrito()
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error al quitar producto')
    }
  }

  const cancelarCompra = async () => {
    if (!confirm('¿Estás seguro de cancelar la compra?')) return
    try {
      await api.post('/api/carrito/cancelar')
      cargarCarrito()
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error al cancelar compra')
    }
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  const subtotal = carrito?.items.reduce((sum, item) => {
    return sum + item.producto.precio * item.cantidad
  }, 0) || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Carrito de Compras</h1>

        {!carrito || carrito.items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">Tu carrito está vacío</p>
              <Link href="/">
                <Button className="mt-4">Ver Productos</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {carrito.items.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <CardTitle>{item.producto.nombre}</CardTitle>
                    <CardDescription>{item.producto.descripcion}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-semibold">
                          ${item.producto.precio.toFixed(2)} x {item.cantidad}
                        </p>
                        <p className="text-sm text-gray-500">
                          Subtotal: ${(item.producto.precio * item.cantidad).toFixed(2)}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => quitarProducto(item.producto_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button
                variant="destructive"
                onClick={cancelarCompra}
                className="w-full"
              >
                Cancelar Compra
              </Button>
            </div>

            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-500 mb-2">
                      * El IVA y envío se calcularán al finalizar la compra
                    </p>
                  </div>
                  <Link href="/checkout" className="block">
                    <Button className="w-full">Finalizar Compra</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

