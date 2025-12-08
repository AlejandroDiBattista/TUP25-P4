"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Minus, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

export default function SidebarCart() {
  const { items, subtotal, iva, envio, total, actualizarCantidad, eliminarDelCarrito, vaciarCarrito } = useCart()
  const [token, setToken] = useState<string | null>(null)
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('token'))
    }
  }, [])

  return (
    <Card className="border-pink-100 card-fancy rounded-2xl sticky top-20">
      {!token ? (
        <CardContent className="py-6 text-center text-gray-600">
          Inicia sesión para ver y editar tu carrito.
          <div className="mt-4">
            <Button asChild variant="outline">
              <Link href="/ingresar">Iniciar sesión</Link>
            </Button>
          </div>
        </CardContent>
      ) : (
        <>
          <CardContent className="space-y-3">
            {items.length === 0 ? (
              <p className="text-sm text-gray-600">Tu carrito está vacío.</p>
            ) : (
              <div className="space-y-3">
                {items.map(({ producto, cantidad }) => (
                  <div key={producto.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded bg-gradient-to-br from-pink-50 to-purple-50 overflow-hidden flex-shrink-0">
                      <img
                        src={`http://127.0.0.1:8000/imagenes/${producto.imagen}`}
                        alt={producto.nombre}
                        className="w-full h-full object-contain p-1.5"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{producto.nombre}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex items-center gap-1 border rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => actualizarCantidad(producto.id!, cantidad - 1)}
                            disabled={cantidad <= 1}
                            aria-label="Disminuir"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-xs font-medium">{cantidad}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => actualizarCantidad(producto.id!, cantidad + 1)}
                            disabled={false}
                            aria-label="Aumentar"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-600 hover:bg-red-50"
                          onClick={() => eliminarDelCarrito(producto.id!)}
                          aria-label="Eliminar"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm font-medium whitespace-nowrap">
                      ${(producto.precio * cantidad).toFixed(2)}
                    </div>
                  </div>
                ))}
                <div className="h-px bg-gray-100 my-2" />
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
                  <span className="font-medium">{envio === 0 ? 'Gratis' : `$${envio.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">${total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2 pt-4">
            <Button asChild className="w-full bg-gradient-to-r from-pink-600 to-purple-600" disabled={items.length === 0}>
              <Link href="/confirmar-compra">Continuar compra</Link>
            </Button>
            {items.length > 0 && !mostrarConfirmacion && (
              <Button 
                variant="outline" 
                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                onClick={() => setMostrarConfirmacion(true)}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar compra
              </Button>
            )}
            {mostrarConfirmacion && (
              <div className="w-full space-y-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium">
                  ¿Estás seguro de que deseas cancelar toda la compra?
                </p>
                <p className="text-xs text-red-600">
                  Se eliminará todo el carrito y se restaurará el stock.
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 text-gray-600 border-gray-300"
                    onClick={() => setMostrarConfirmacion(false)}
                  >
                    No, mantener
                  </Button>
                  <Button 
                    size="sm"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    onClick={async () => {
                      await vaciarCarrito()
                      setMostrarConfirmacion(false)
                      toast.success('Carrito cancelado y stock restaurado')
                    }}
                  >
                    Sí, cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardFooter>
        </>
      )}
    </Card>
  )
}
