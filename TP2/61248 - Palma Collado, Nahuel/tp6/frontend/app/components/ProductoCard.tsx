import { Producto } from '../types';
import Image from 'next/image';

interface ProductoCardProps {
  producto: Producto;
  onAgregar?: (productoId: number) => void;
  disabled?: boolean;
}

export default function ProductoCard({ producto, onAgregar, disabled }: ProductoCardProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg">
      <div className="relative h-64 bg-gray-100">
        {producto.imagen ? (
          <Image
            src={`${API_URL}/${producto.imagen}`}
            alt={producto.nombre}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain p-4"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Sin imagen
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {producto.nombre}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {producto.descripcion}
        </p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {producto.categoria}
          </span>
          {producto.valoracion ? (
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">★</span>
              <span className="text-sm text-gray-700">{producto.valoracion.toFixed(1)}</span>
            </div>
          ) : (
            <span className="text-xs text-gray-400">Sin valoraciones</span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-blue-600">
            ${producto.precio}
          </span>
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {producto.existencia > 0 ? `Stock: ${producto.existencia}` : 'Agotado'}
          </span>
        </div>
        {onAgregar && (
          <button
            onClick={() => onAgregar(producto.id)}
            disabled={producto.existencia === 0 || disabled}
            className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {producto.existencia === 0 ? 'Sin stock' : 'Agregar al carrito'}
          </button>
        )}
      </div>
    </div>
  );
}
