'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Package } from 'lucide-react'
import Link from 'next/link'

interface CompraResumen {
  id: number
  fecha: string
  total: number
  cantidad_items: number
}

export default function ComprasPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [compras, setCompras] = useState<CompraResumen[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    cargarCompras()
  }, [isAuthenticated, router])

  const cargarCompras = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/compras')
      setCompras(response.data)
    } catch (error) {
      console.error('Error al cargar compras:', error)
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
        <h1 className="text-3xl font-bold mb-6">Mis Compras</h1>

        {compras.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No tienes compras realizadas</p>
              <Link href="/">
                <Button className="mt-4">Ver Productos</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {compras.map((compra) => (
              <Card key={compra.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Compra #{compra.id}</CardTitle>
                      <CardDescription>
                        {new Date(compra.fecha).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">${compra.total.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">
                        {compra.cantidad_items} {compra.cantidad_items === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Link href={`/compras/${compra.id}`}>
                    <Button variant="outline" className="w-full">
                      Ver Detalle
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

