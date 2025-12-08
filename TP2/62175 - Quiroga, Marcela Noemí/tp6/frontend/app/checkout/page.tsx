'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [direccion, setDireccion] = useState('')
  const [tarjeta, setTarjeta] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await api.post('/api/carrito/finalizar', {
        direccion,
        tarjeta
      })
      alert('Compra finalizada exitosamente')
      router.push(`/compras/${response.data.id}`)
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error al finalizar la compra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/carrito">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Carrito
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Finalizar Compra</h1>

        <Card>
          <CardHeader>
            <CardTitle>Información de Envío y Pago</CardTitle>
            <CardDescription>
              Completa los datos para finalizar tu compra
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección de Envío</Label>
                <Input
                  id="direccion"
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Calle, número, ciudad, código postal"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tarjeta">Número de Tarjeta</Label>
                <Input
                  id="tarjeta"
                  type="text"
                  value={tarjeta}
                  onChange={(e) => setTarjeta(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Procesando...' : 'Finalizar Compra'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

