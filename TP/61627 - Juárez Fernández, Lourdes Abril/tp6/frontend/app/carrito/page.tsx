"use client"
import { useCart } from '../context/CartContext'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function CarritoPage() {
  const { items, actualizarCantidad, eliminarDelCarrito, subtotal, iva, envio, total } = useCart()

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
  <Card className="w-full max-w-md text-center border-pink-100 card-fancy rounded-2xl">
          <CardContent className="pt-6 pb-6">
            <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Tu carrito está vacío</h2>
            <p className="text-gray-600 mb-6">Agrega productos para comenzar tu compra</p>
            <Button asChild className="bg-gradient-to-r from-pink-600 to-purple-600">
              <Link href="/">
                Ver productos
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          Mi Carrito
        </h1>
        <Link href="/" className="text-sm text-gray-600 hover:text-pink-600">
          ← Seguir comprando
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Lista de productos */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ producto, cantidad }) => (
            <Card key={producto.id} className="border-pink-100 card-fancy rounded-2xl">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg flex-shrink-0 overflow-hidden">
                    <img
                      src={`http://127.0.0.1:8000/imagenes/${producto.imagen}`}
                      alt={producto.nombre}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{producto.nombre}</h3>
                        <p className="text-sm text-gray-600">{producto.categoria}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => eliminarDelCarrito(producto.id!)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 border rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => actualizarCantidad(producto.id!, cantidad - 1)}
                          disabled={cantidad <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{cantidad}</span>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => actualizarCantidad(producto.id!, cantidad + 1)}
                          disabled={cantidad >= (producto.existencia || 0)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          ${producto.precio.toFixed(2)} c/u
                        </p>
                        <p className="text-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                          ${(producto.precio * cantidad).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Resumen */}
        <div className="lg:col-span-1">
          <Card className="border-pink-100 card-fancy rounded-2xl sticky top-20">
            <CardHeader>
              <CardTitle>Resumen del carrito</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">IVA</span>
                <span className="font-medium">${iva.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Envío</span>
                <span className="font-medium">
                  {envio === 0 ? (
                    <span className="text-green-600">¡Gratis!</span>
                  ) : (
                    `$${envio.toFixed(2)}`
                  )}
                </span>
              </div>
              {subtotal > 0 && subtotal < 1000 && (
                <p className="text-xs text-pink-600 bg-pink-50 p-2 rounded">
                  💡 Agregá ${(1000 - subtotal).toFixed(2)} más para obtener envío gratis
                </p>
              )}
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  ${total.toFixed(2)}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                asChild 
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
              >
                <Link href="/confirmar-compra">
                  Continuar compra
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
