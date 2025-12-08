import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCardNew'
import CartWidget from '../components/CartWidget'
import { fetchProductos } from '../lib/api'

export default function Home(){
  const [productos, setProductos] = useState([])

  useEffect(()=>{ load() }, [])
  async function load(){
    const data = await fetchProductos()
    setProductos(data || [])
  }

  return (
    <div>
      <Navbar />
      <main className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Productos</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {productos.map(p=> <ProductCard key={p.id || p.producto_id} p={p} />)}
            </div>
          </div>
          <div className="md:col-span-1">
            <CartWidget />
          </div>
        </div>
      </main>
    </div>
  )
}
