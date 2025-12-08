import Image from 'next/image';
import Link from 'next/link';
import { Producto } from '../types'; 


interface ProductoCardProps {
  producto: Producto;
}

export default function ProductoCard({ producto }: ProductoCardProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  return (
    <Link href={`/producto/${producto.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
        <div className="relative h-64 bg-gray-100">
          <Image
            src={`${API_URL}/imagenes/${producto.imagen}`}
            alt={producto.titulo}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain p-4"
            unoptimized
          />
        </div>
        {/* Contenedor que crece para empujar el footer hacia abajo */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
            {producto.titulo}
          </h3>
          <p className="text-sm text-black-600 mb-3 line-clamp-2 flex-grow">
            {producto.descripcion}
          </p>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-black-500 bg-gray-100 px-2 py-1 rounded">
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
        </div>
      </div>
    </Link>
  );
}