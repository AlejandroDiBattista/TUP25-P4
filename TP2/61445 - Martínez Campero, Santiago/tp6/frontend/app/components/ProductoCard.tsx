import { Producto } from '../types';
import Image from 'next/image';
import Link from 'next/link';
import Rating from './Rating';

interface ProductoCardProps {
  producto: Producto;
}

export default function ProductoCard({ producto }: ProductoCardProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  return (
    <Link href={`/productos/${producto.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer h-full flex flex-col">
        <div className="relative h-64 bg-gray-100">
          <Image
            src={`${API_URL}/${producto.imagen}`}
            alt={producto.nombre}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain p-4"
            unoptimized
          />
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
            {producto.nombre}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {producto.descripcion}
          </p>
          
          <div className="mb-3">
            <Rating valoracion={producto.valoracion} tamaño="pequeño" />
          </div>

          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {producto.categoria}
            </span>
            <span className={`text-xs px-2 py-1 rounded font-medium ${
              producto.existencia > 0
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {producto.existencia > 0 ? 'En stock' : 'Sin stock'}
            </span>
          </div>

          <div className="border-t pt-3 mt-auto">
            <div className="flex justify-between items-center mb-3">
              <span className="text-2xl font-bold text-blue-600">
                ${producto.precio.toFixed(2)}
              </span>
              <span className="text-xs text-gray-600 font-medium">
                {producto.existencia} disponibles
              </span>
            </div>
            
            {/* Botón de estado */}
            {producto.existencia === 0 ? (
              <div className="w-full">
                <button
                  disabled
                  className="w-full py-2 px-4 bg-red-500 text-white font-semibold rounded-lg cursor-not-allowed opacity-90"
                >
                  AGOTADO
                </button>
              </div>
            ) : (
              <div className="w-full">
                <button
                  className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Ver detalles
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
