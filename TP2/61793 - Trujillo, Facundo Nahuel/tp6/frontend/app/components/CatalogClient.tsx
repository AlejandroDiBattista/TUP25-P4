"use client"

import React, { useState } from 'react'
import type { Producto } from '../types'
import ProductoCard from './ProductoCard'

type Props = {
  initialProductos: Producto[]
}

export default function CatalogClient({ initialProductos }: Props) {
  const [productos, setProductos] = useState<Producto[]>(initialProductos || [])
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('')

  const productosFiltrados = productos.filter(p =>
    ((p.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.descripcion || '').toLowerCase().includes(busqueda.toLowerCase())) &&
    (categoria === '' || (p.categoria || '') === categoria)
  )

  const categorias = Array.from(new Set(productos.map(p => p.categoria || '').filter(Boolean)))

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <input
          type="text"
          placeholder="Buscar..."
          className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-1/2"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <select
          className="border border-gray-300 rounded-lg px-3 py-2"
          value={categoria}
          onChange={e => setCategoria(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categorias.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="space-y-4 mt-4">
        {productosFiltrados.map(p => (
          <ProductoCard key={p.id} producto={p} />
        ))}
      </div>
    </>
  )
}
