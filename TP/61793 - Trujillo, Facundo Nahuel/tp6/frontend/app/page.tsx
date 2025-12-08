import CatalogClient from './components/CatalogClient'
import MiniCart from './components/MiniCart'
import type { Producto } from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default async function Home() {
  // Fetch productos on the server so the catalog shows immediately on first load
  let productos: Producto[] = []
  try {
    const res = await fetch(`${API_URL}/productos`)
    if (res.ok) productos = await res.json()
  } catch (e) {
    // ignore fetch errors on server; productos quedarán vacíos
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <CatalogClient initialProductos={productos} />
      </div>

      <aside className="lg:col-span-1">
        <MiniCart />
      </aside>
    </div>
  )
}
