"use client"
import { useEffect, useState } from 'react'
import { obtenerProductos } from './services/productos'
import ProductoCard from './components/ProductoCard'
import SidebarCart from './components/SidebarCart'
import { Producto } from './types'
import { Input } from '@/components/ui/input'
import { Search, Filter } from 'lucide-react'
import { useCart } from './context/CartContext'

export default function Home() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('')
  const [cargando, setCargando] = useState(true)
  const { setOnProductosChange } = useCart()

  const cargarProductos = async () => {
    try {
      const productos = await obtenerProductos()
      setProductos(productos)
    } catch (error) {
      console.error('Error cargando productos:', error)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarProductos()
  }, [])

  useEffect(() => {
    setOnProductosChange(() => cargarProductos)
    return () => setOnProductosChange(null)
  }, [setOnProductosChange])

  const productosFiltrados = productos.filter(p =>
    ((p.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.descripcion || '').toLowerCase().includes(busqueda.toLowerCase())) &&
    (categoria === '' || (p.categoria || '') === categoria)
  )

  const categorias = Array.from(new Set(productos.map(p => p.categoria || '').filter(Boolean)))

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          Catálogo de Productos
        </h1>
        <p className="text-gray-600">Descubre nuestra selección de productos</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl shadow-sm border">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar productos..."
            className="pl-10"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-auto">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <select
            className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none"
            value={categoria}
            onChange={e => setCategoria(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {cargando ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-pink-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Cargando productos...</p>
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No se encontraron productos</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {productosFiltrados.map(p => (
                <ProductoCard key={p.id} producto={p} />
              ))}
            </div>
          )}
        </div>
        <div className="lg:col-span-1">
          <SidebarCart />
        </div>
      </div>
    </div>
  )
}