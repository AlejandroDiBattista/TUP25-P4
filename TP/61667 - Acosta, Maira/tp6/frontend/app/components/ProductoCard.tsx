// app/components/ProductoCard.tsx
import { Producto } from "@/types"
import { useState } from "react"
import { useToast } from "./ToastProvider"
import { useCart } from "../contexts/CartProvider"

interface ProductoCardProps {
  producto: Producto
}

export default function ProductoCard({ producto }: ProductoCardProps) {
  const [loading, setLoading] = useState(false)
  const [imageError, setImageError] = useState(false)
  const toast = useToast()
  function imageUrl(imagen?: string) {
    if (!imagen) return undefined;
    if (imagen.startsWith("http://") || imagen.startsWith("https://")) return imagen;
    // si viene con slash al inicio
    if (imagen.startsWith("/")) return `http://localhost:8000${imagen}`;
    // si solo el nombre o 'imagenes/foo.jpg'
    if (imagen.startsWith("imagenes/")) return `http://localhost:8000/${imagen}`;
    return `http://localhost:8000/imagenes/${imagen}`;
  }

  const { reserved, add } = useCart()
  
  const reservedCount = reserved[producto.id] || 0
  const disponible = Math.max(0, (producto.existencia || 0) - reservedCount)

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 flex gap-4">
      <div className="w-24 h-24 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
        {!imageError && producto.imagen ? (
          <img
            src={imageUrl(producto.imagen)}
            alt={producto.nombre}
            className="w-full h-full object-cover rounded"
            onError={handleImageError}
          />
        ) : (
          <div className="text-gray-400 text-xs text-center">
            Sin imagen
          </div>
        )}
      </div>

      <div className="flex-1">
        <h3 className="text-xl font-semibold">{producto.nombre}</h3>
        <p className="text-gray-600 mt-2">{producto.descripcion}</p>
        <p className="text-sm text-gray-500 mt-1">Categoría: {producto.categoria}</p>
      </div>

      <div className="text-right">
        <div className="text-2xl font-bold">${producto.precio.toFixed(2)}</div>
        <div className="text-sm text-gray-600">
          {disponible > 0 ? `Disponible: ${disponible}` : 'Agotado'}
        </div>
        <button
          className="bg-gray-800 text-white px-6 py-2 rounded mt-2 hover:bg-gray-700 disabled:bg-gray-300"
          disabled={!(disponible && disponible > 0) || loading}
          onClick={async () => {
            // Si no hay token, avisar al usuario que inicie sesión
            if (typeof window !== 'undefined') {
              const token = window.localStorage.getItem('token')
              if (!token) {
                toast.show('Inicia sesión para agregar productos al carrito', 'info')
                return
              }
            }
            try {
              setLoading(true)
              // use cart context to optimistically update UI
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
