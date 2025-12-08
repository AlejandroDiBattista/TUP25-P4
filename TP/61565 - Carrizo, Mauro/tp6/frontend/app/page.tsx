'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, LogOut, Package } from 'lucide-react'
import Link from 'next/link'

interface Producto {
  id: number
  nombre: string
  descripcion: string
  precio: number
  categoria: string
  existencia: number
}

export default function Home() {
  const { isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [productos, setProductos] = useState<Producto[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('')
  const [categorias, setCategorias] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    cargarProductos()
  }, [isAuthenticated, router])

  const cargarProductos = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (busqueda) params.append('busqueda', busqueda)
      if (categoria) params.append('categoria', categoria)
      
      const response = await api.get(`/api/productos?${params.toString()}`)
      setProductos(response.data)
      
      // Extraer categorías únicas
      const cats = [...new Set(response.data.map((p: Producto) => p.categoria))]
      setCategorias(cats)
    } catch (error) {
      console.error('Error al cargar productos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      cargarProductos()
    }
  }, [busqueda, categoria])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const agregarAlCarrito = async (productoId: number) => {
    try {
      await api.post('/api/carrito', {
        producto_id: productoId,
        cantidad: 1
      })
      alert('Producto agregado al carrito')
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error al agregar producto')
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">E-commerce</h1>
          <div className="flex gap-4">
            <Link href="/carrito">
              <Button variant="outline">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Carrito
              </Button>
            </Link>
            <Link href="/compras">
              <Button variant="outline">
                <Package className="mr-2 h-4 w-4" />
                Mis Compras
              </Button>
            </Link>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 space-y-4">
          <Input
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="max-w-md"
          />
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={categoria === '' ? 'default' : 'outline'}
              onClick={() => setCategoria('')}
            >
              Todas
            </Button>
            {categorias.map((cat) => (
              <Button
                key={cat}
                variant={categoria === cat ? 'default' : 'outline'}
                onClick={() => setCategoria(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Cargando productos...</div>
        ) : productos.length === 0 ? (
          <div className="text-center py-12">No se encontraron productos</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productos.map((producto) => (
              <Card key={producto.id}>
                <CardHeader>
                  <CardTitle>{producto.nombre}</CardTitle>
                  <CardDescription>{producto.descripcion}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">${producto.precio.toFixed(2)}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Categoría: {producto.categoria}
                  </p>
                  {producto.existencia === 0 ? (
                    <p className="text-red-500 font-semibold mt-2">Agotado</p>
                  ) : (
                    <p className="text-green-600 mt-2">Disponible: {producto.existencia}</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => agregarAlCarrito(producto.id)}
                    disabled={producto.existencia === 0}
                    className="w-full"
                  >
                    {producto.existencia === 0 ? 'Agotado' : 'Agregar al Carrito'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

