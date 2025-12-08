"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface CompraResumen {
  id: number
  fecha: number
  total: number
  envio: number
  tarjeta?: string
}

export default function ComprasPage() {
  const [compras, setCompras] = useState<CompraResumen[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      router.push('/ingresar')
      return
    }
    const fetchData = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/compras', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.status === 401) {
          router.push('/ingresar')
          return
        }
        if (!res.ok) throw new Error('No se pudo obtener compras')
        const data = await res.json()
        setCompras(data || [])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar compras')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [router])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Mis compras</h1>

      {loading ? (
        <p className="text-gray-600">Cargando...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : compras.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center text-gray-600">No tenés compras aún.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {compras.map(c => (
            <Card key={c.id} className="border-pink-100">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Compra #{c.id}</span>
                  <span className="text-sm text-gray-500">{new Date(c.fecha * 1000).toLocaleString()}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  <div>Total: <strong>${c.total.toFixed(2)}</strong></div>
                  <div>Envío: {c.envio === 0 ? 'Gratis' : `$${c.envio.toFixed(2)}`}</div>
                  {c.tarjeta && <div className="text-gray-500">Tarjeta: {c.tarjeta}</div>}
                </div>
                <Button asChild className="bg-gradient-to-r from-pink-600 to-purple-600">
                  <Link href={`/compras/${c.id}`}>Ver detalle</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
