// frontend/app/components/ProductoCard.tsx
import { Producto } from '../types';
import Image from 'next/image';

interface ProductoCardProps {
  producto: Producto;
}

export default function ProductoCard({ producto }: ProductoCardProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-64 bg-gray-100 flex justify-center items-center">
        {producto.imagen ? (
          <Image
            src={`${API_URL}/imagenes/${producto.imagen}`}
            alt={producto.nombre}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain p-4"
            unoptimized
          />
        ) : (
          <span className="text-gray-400">Sin imagen</span>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {producto.nombre}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {producto.descripcion || 'Sin descripción disponible'}
        </p>

        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {producto.categoria || 'General'}
          </span>
          <span className="text-xs text-gray-500">
            Stock: {producto.stock ?? '—'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-blue-600">
            ${producto.precio.toFixed(2)}
          </span>
          <button className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}
