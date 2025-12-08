import { Producto } from '../types';
import Image from 'next/image';

interface ProductoCardProps {
  producto: Producto;
}

export default function ProductoCard({ producto }: ProductoCardProps) {
  // URL base del backend
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Imagen del producto */}
      <div className="relative h-64 bg-gray-100">
        <Image
          // Construimos la URL dinámica según el ID del producto
          src={`${API_URL}/imagenes/${producto.id.toString().padStart(4, '0')}.png`}
          alt={producto.titulo}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain p-4"
          unoptimized // Para cargar imágenes externas sin optimización de Next.js
        />
      </div>

      {/* Información del producto */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {producto.titulo}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {producto.descripcion}
        </p>

        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {producto.categoria}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span className="text-sm text-gray-700">{producto.valoracion}</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-blue-600">
            ${producto.precio}
          </span>
          <span className="text-xs text-gray-500">
            Stock: {producto.existencia}
          </span>
        </div>

        {producto.existencia === 0 && (
          <span className="text-red-500 text-sm mt-2 block">Agotado</span>
        )}
      </div>
    </div>
  );
}
