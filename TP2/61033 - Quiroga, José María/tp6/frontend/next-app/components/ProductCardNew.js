import { useCart } from '../context/CartContext'
import React, { useState, useEffect } from 'react'

export default function ProductCardNew({p, onAdd}){
  const { addItem } = useCart()
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

  const outOfStock = p.existencia === 0 || p.existence === 0 || (p.existence === undefined && p.existencia === undefined && (p.stock === 0))
  const title = p.nombre || p.titulo || p.name || 'Sin nombre'
  const price = Number(p.precio ?? p.price ?? 0).toFixed(2)
  const priceNum = Number(p.precio ?? p.price ?? 0)
  const category = (p.categoria || p.category || '').toString().toLowerCase()
  const ivaRate = (category.includes('electron') || category.includes('electr')) ? 0.10 : 0.21
  const priceWithIva = Math.round((priceNum * (1 + ivaRate)) * 100) / 100
  const rawImagen = p.imagen || p.image || ''
  const imagenRaw = (typeof rawImagen === 'string' && (rawImagen === 'undefined' || rawImagen === 'null')) ? '' : rawImagen

  const placeholder = '/placeholder.svg'
  let imageSrc = placeholder
  if (imagenRaw) {
    const isFullUrl = imagenRaw.startsWith('http://') || imagenRaw.startsWith('https://')
    if (isFullUrl) imageSrc = imagenRaw
    else imageSrc = `${API_BASE}/${imagenRaw.replace(/^\/+/, '')}`
  }

  const handleAdd = () => {
    const id = p.id || p.producto_id || p.producto?.id
    if (!id) return
    if (onAdd) onAdd(p)
    else addItem(id, 1)
  }

  // show a small confirmation message when product is added
  const [added, setAdded] = useState(false)
  useEffect(() => {
    let t
    if (added) t = setTimeout(() => setAdded(false), 2000)
    return () => clearTimeout(t)
  }, [added])

  return (
    <div>
      {added && (
        <div className="mb-2 text-sm text-emerald-700 bg-emerald-100 px-3 py-1 rounded text-center">Producto añadido al carrito</div>
      )}
      <div className="bg-white rounded shadow p-4">
        {imagenRaw ? (
          <img src={imageSrc} alt={title} className="w-full h-40 object-cover mb-3 rounded" loading="lazy" onError={(e)=> { e.currentTarget.onerror = null; e.currentTarget.src = placeholder }} />
        ) : (
          <img src={placeholder} alt="Sin imagen" className="w-full h-40 object-cover mb-3 rounded bg-gray-100" />
        )}

        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-gray-600">{p.descripcion}</p>
        <div className="flex items-center justify-between mt-3">
          <div>
            <div className="text-lg font-bold text-red-600">${priceWithIva.toFixed(2)}</div>
            <div className="text-xs text-gray-500">incl. IVA {Math.round(ivaRate*100)}%</div>
          </div>
          <div>
            {outOfStock ? (
              <span className="text-red-500">Agotado</span>
            ) : (
              <button onClick={() => { handleAdd(); setAdded(true); }} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-150">Agregar</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
