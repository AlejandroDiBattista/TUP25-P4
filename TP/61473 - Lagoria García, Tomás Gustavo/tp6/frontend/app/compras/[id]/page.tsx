'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { obtenerDetalleCompra } from '@/app/services/compras'
import { CompraDetalle } from '@/app/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Calendar, MapPin, CreditCard, Package, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

export default function CompraDetallePage() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated } = useAuth()
  const [compra, setCompra] = useState<CompraDetalle | null>(null)
  const [loading, setLoading] = useState(true)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para ver tus compras')
      router.push('/login')
      return
    }

    if (params.id) {
      cargarDetalle()
    }
  }, [isAuthenticated, params.id, router])

  const cargarDetalle = async () => {
    try {
      setLoading(true)
      const compraId = parseInt(params.id as string)
      const data = await obtenerDetalleCompra(compraId)
      setCompra(data)
    } catch (error) {
      toast.error('Error al cargar el detalle de la compra')
      console.error(error)
      // Redirigir a la lista de compras después de un breve delay
      setTimeout(() => router.push('/compras'), 2000)
    } finally {
      setLoading(false)
    }
  }

  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(valor)
  }

  const enmascararTarjeta = (tarjeta: string) => {
    // Mostrar solo los últimos 4 dígitos
    return tarjeta.replace(/\d(?=\d{4})/g, '*')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 w-full" />
          </div>
          <div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!compra) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Compra no encontrada</h3>
            <p className="text-muted-foreground text-center mb-6">
              No se pudo cargar el detalle de esta compra.
            </p>
            <Button onClick={() => router.push('/compras')}>
              Volver a mis compras
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.push('/compras')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a mis compras
        </Button>
        
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShoppingBag className="h-8 w-8" />
          Detalle de la compra
        </h1>
        <p className="text-muted-foreground mt-2">
          Compra #{compra.id}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Columna izquierda: Productos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información general */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Información de la compra
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-medium">{formatearFecha(compra.fecha)}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Dirección de envío</p>
                  <p className="font-medium">{compra.direccion}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Tarjeta</p>
                  <p className="font-medium">{enmascararTarjeta(compra.tarjeta)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de productos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Productos
              </CardTitle>
              <CardDescription>
                {compra.cantidad_items} {compra.cantidad_items === 1 ? 'producto' : 'productos'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {compra.items.map((item) => {
                  // Construir URL completa de la imagen (igual que en ProductCard)
                  const imagenUrl = item.imagen 
                    ? `${API_URL}/${item.imagen}` 
                    : '/placeholder.jpg'
                  
                  return (
                    <div 
                      key={item.id} 
                      className="flex gap-4 pb-4 border-b last:border-0 last:pb-0"
                    >
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                        <Image
                          src={imagenUrl}
                          alt={item.nombre}
                          fill
                          className="object-cover"
                          sizes="80px"
                          unoptimized
                        />
                      </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{item.nombre}</h4>
                      <p className="text-sm text-muted-foreground">
                        Categoría: {item.categoria}
                      </p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          {item.cantidad} × {formatearMoneda(item.precio_unitario)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold">{formatearMoneda(item.subtotal)}</p>
                    </div>
                  </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha: Resumen */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Resumen de pago</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatearMoneda(compra.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IVA</span>
                  <span>{formatearMoneda(compra.iva)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envío</span>
                  <span>
                    {compra.envio === 0 ? (
                      <span className="text-green-600 font-medium">Gratis</span>
                    ) : (
                      formatearMoneda(compra.envio)
                    )}
                  </span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total pagado</span>
                  <span className="text-2xl font-bold">{formatearMoneda(compra.total)}</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/')}
              >
                Volver al catálogo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
