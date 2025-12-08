"use client"
import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, CreditCard, MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ConfirmarCompraPage() {
  const router = useRouter()
  const { items, subtotal, iva, envio, total, vaciarCarrito } = useCart()
  const [mounted, setMounted] = useState(false)
  const [direccion, setDireccion] = useState('')
  const [tarjeta, setTarjeta] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)

  useEffect(() => {
    if (items.length === 0 && !exito) {
      router.push('/carrito')
    }
  }, [items.length, exito, router])

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setCargando(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/ingresar')
        return
      }

      const response = await fetch('http://127.0.0.1:8000/carrito/finalizar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ direccion, tarjeta })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Error al finalizar compra')
      }

      setExito(true)
      vaciarCarrito()
      
      setTimeout(() => {
        router.push('/')
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la compra')
    } finally {
      setCargando(false)
    }
  }

  if (exito) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
  <Card className="w-full max-w-md text-center border-pink-100 card-fancy rounded-2xl">
          <CardContent className="pt-6 pb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-green-600">¡Compra confirmada!</h2>
            <p className="text-gray-600 mb-2">Tu pedido ha sido procesado exitosamente</p>
            <p className="text-sm text-gray-500">Redirigiendo a inicio...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
        Finalizar compra
      </h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Formulario de datos */}
        <div className="space-y-6">
          <Card className="border-pink-100 card-fancy rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-pink-600" />
                Datos de envío
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    placeholder="Calle, número, ciudad, código postal..."
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tarjeta">Tarjeta</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="tarjeta"
                      placeholder="**** **** **** 1234"
                      className="pl-10"
                      value={tarjeta}
                      onChange={(e) => setTarjeta(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                  disabled={cargando}
                >
                  {cargando ? 'Procesando...' : 'Confirmar compra'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Resumen del carrito */}
        <div>
          <Card className="border-pink-100 card-fancy rounded-2xl">
            <CardHeader>
              <CardTitle>Resumen del carrito</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map(({ producto, cantidad }) => (
                  <div key={producto.id} className="flex justify-between text-sm pb-3 border-b">
                    <div className="flex-1">
                      <p className="font-medium">{producto.nombre}</p>
                      <p className="text-gray-500">Cantidad: {cantidad}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${(producto.precio * cantidad).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">inc. IVA ${((producto.precio * cantidad) * (producto.categoria?.toLowerCase().includes('electrónica') ? 0.21 : 0.105)).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-3 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total productos</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">IVA</span>
                  <span className="font-medium">${iva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Envío</span>
                  <span className={`font-medium ${envio === 0 ? 'text-green-600' : ''}`}>
                    {envio === 0 ? '¡Gratis!' : `$${envio.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t">
                  <span>Total a pagar</span>
                  <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
