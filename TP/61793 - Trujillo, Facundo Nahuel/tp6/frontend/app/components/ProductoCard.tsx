 
import { Producto } from '../types'
import { useState } from 'react'
import { useToast } from './ToastProvider'
import { useCart } from './CartProvider'

export default function ProductoCard({ producto }: { producto: Producto }) {
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  function imageUrl(imagen?: string) {
    if (!imagen) return undefined;
    if (imagen.startsWith("http://") || imagen.startsWith("https://")) return imagen;
    
    if (imagen.startsWith("/")) return `http://localhost:8000${imagen}`;
    
    if (imagen.startsWith("imagenes/")) return `http://localhost:8000/${imagen}`;
    return `http://localhost:8000/imagenes/${imagen}`;
  }

  const { reserved, add } = useCart()

  const reservedCount = reserved[producto.id] || 0
  const disponible = Math.max(0, (producto.existencia || 0) - reservedCount)

  return (
    <div className="flex justify-between items-start bg-white rounded-lg border p-4 hover:shadow-lg transition">
      <div className="flex gap-4 items-start">
        {producto.imagen ? (
          <img
            src={imageUrl(producto.imagen)}
            alt={producto.nombre}
            className="w-40 h-28 object-cover rounded-md"
          />
        ) : (
          <div className="placeholder w-40 h-28" />
        )}
        <div className="max-w-xl">
          <h2 className="text-lg font-semibold">{producto.nombre}</h2>
          <p className="text-gray-600 text-sm line-clamp-3">{producto.descripcion}</p>
          <p className="text-gray-500 text-xs mt-2">Categoría: {producto.categoria}</p>
        </div>
      </div>

      <div className="text-right flex flex-col items-end">
        <p className="font-semibold text-lg">${producto.precio.toFixed(2)}</p>
        <p className={`text-sm ${disponible > 0 ? 'text-gray-600' : 'text-red-600'}`}>
          {disponible > 0 ? `Disponible: ${disponible}` : 'Agotado'}
        </p>
        <button
          className="mt-3 bg-[#0b1726] text-white px-4 py-2 rounded disabled:bg-gray-300"
          disabled={!(disponible && disponible > 0) || loading}
          onClick={async () => {
            
            if (typeof window !== 'undefined') {
              const token = window.localStorage.getItem('token')
              if (!token) {
                toast.show('Inicia sesión para agregar productos al carrito', 'info')
                return
              }
            }
            try {
              setLoading(true)
              
              await add(producto, 1)
              toast.show('Producto agregado al carrito', 'success')
            } catch (err: any) {
              toast.show('Error al agregar al carrito: ' + (err?.message || err), 'error')
            } finally {
              setLoading(false)
            }
          }}
        >
          {loading ? 'Agregando...' : 'Agregar al carrito'}
        </button>
      </div>
    </div>
  )
}
