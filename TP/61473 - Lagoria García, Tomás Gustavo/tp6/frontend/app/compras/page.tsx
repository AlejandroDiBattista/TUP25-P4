'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { listarCompras } from '@/app/services/compras'
import { CompraResumen } from '@/app/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ShoppingBag, Calendar, DollarSign, Package, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

export default function ComprasPage() {
  const router = useRouter()
  const { usuario, isAuthenticated } = useAuth()
  const [compras, setCompras] = useState<CompraResumen[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para ver tus compras')
      router.push('/login')
      return
    }

    cargarCompras()
  }, [isAuthenticated, router])

  const cargarCompras = async () => {
    try {
      setLoading(true)
      const data = await listarCompras()
      setCompras(data)
    } catch (error) {
      toast.error('Error al cargar el historial de compras')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleString('es-AR', {
      year: 'numeric',
      month: 'numeric',
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Mis compras</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (compras.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-8 w-8" />
            Mis compras
          </h1>
          <p className="text-muted-foreground mt-2">
            Historial de todas tus compras realizadas
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No hay compras registradas</h3>
            <p className="text-muted-foreground text-center mb-6">
              Aún no has realizado ninguna compra. ¡Explora nuestro catálogo!
            </p>
            <Button onClick={() => router.push('/')}>
              Ver productos
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShoppingBag className="h-8 w-8" />
          Mis compras
        </h1>
        <p className="text-muted-foreground mt-2">
          Historial completo de tus compras realizadas
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {compras.map((compra) => (
          <Card
            key={compra.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push(`/compras/${compra.id}`)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Compra #{compra.id}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Calendar className="h-4 w-4" />
                    {formatearFecha(compra.fecha)}
                  </CardDescription>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span className="text-sm">
                      {compra.cantidad_items} {compra.cantidad_items === 1 ? 'producto' : 'productos'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between border-t pt-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Total pagado:</span>
                  </div>
                  <span className="text-xl font-bold">{formatearMoneda(compra.total)}</span>
                </div>

                <Button 
                  className="w-full mt-2" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/compras/${compra.id}`)
                  }}
                >
                  Ver detalle completo
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Button
          variant="outline"
          onClick={() => router.push('/')}
        >
          Volver al catálogo
        </Button>
      </div>
    </div>
  )
}
