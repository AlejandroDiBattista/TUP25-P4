"use client";

import { Producto } from '../types';
import Image from 'next/image';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

export default function ProductoCard({ producto }: { producto: Producto }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const { addItem, fetchCart } = useCart();
  const hayStock = producto.existencia > 0;

  const handleAddToCart = () => {
    try {
      addItem(producto.id, 1);
    } catch (error: any) {

      if (error.message.includes('autenticado')) {
        toast.error("Por favor, inicia sesión para agregar productos.");

      } else {
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <div className="relative h-64 bg-gray-100">
        <Image
          src={`${API_URL}/${producto.imagen}`}
          alt={producto.titulo}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain p-4"
          unoptimized
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <p className="text-xs text-gray-500 mb-1">{producto.categoria}</p>
        <h3 className="text-md font-semibold text-gray-800 mb-2 line-clamp-2 flex-grow">{producto.titulo}</h3>
        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold text-pink-600">${producto.precio}</span>
          <span className={`text-sm font-medium ${hayStock ? 'text-gray-700' : 'text-red-500'}`}>
            {hayStock ? `Disponible: ${producto.existencia}` : 'Agotado'}
          </span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={!hayStock}
          className={`w-full px-4 py-2 rounded-md font-semibold text-sm transition-colors
            ${hayStock
              ? 'bg-pink-500 text-white hover:bg-pink-600'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {hayStock ? 'Agregar al carrito' : 'Agotado'}
        </button>
      </div>
    </div>
  );
}