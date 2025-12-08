'use client';

import { Producto } from '../types';
import { useCarrito } from '../context/CarritoContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ProductoCardProps {
  producto: Producto;
}

export default function ProductoCard({ producto }: ProductoCardProps) {
  const { agregarAlCarrito } = useCarrito();
  const { token } = useAuth();
  const router = useRouter();
  const [cantidad, setCantidad] = useState(1);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const handleAgregarAlCarrito = () => {
    if (!token) {
      router.push('/auth');
      return;
    }
    agregarAlCarrito(producto.id, cantidad);
    setCantidad(1); // Resetear a 1 después de agregar
  };

  const incrementar = () => {
    if (cantidad < producto.existencia) {
      setCantidad(prev => prev + 1);
    }
  };

  const decrementar = () => {
    if (cantidad > 1) {
      setCantidad(prev => prev - 1);
    }
  };

  return (
    <div className="bg-white border border-gray-200 overflow-hidden hover:border-black transition-colors flex flex-col group">
      <div className="relative h-64 bg-gray-50 overflow-hidden">
        <img
          src={`${API_URL}/${producto.imagen}`}
          alt={producto.titulo}
          className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=' + producto.titulo;
          }}
        />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-base font-normal text-black mb-2 line-clamp-2">
          {producto.titulo}
        </h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2 font-light">
          {producto.descripcion}
        </p>
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-gray-400 uppercase tracking-wider">
            {producto.categoria}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-black">★</span>
            <span className="text-sm text-gray-700">{producto.valoracion}</span>
          </div>
        </div>
        <div className="flex justify-between items-center mb-4 mt-auto">
          <span className="text-xl font-light text-black-600">
            ${producto.precio}
          </span>
          <span className="text-xs text-gray-400">
            Stock: {producto.existencia}
          </span>
        </div>
        
        {/* Selector de cantidad */}
        {producto.existencia > 0 && (
          <div className="flex items-center justify-center gap-3 mb-3">
            <button
              onClick={decrementar}
              disabled={cantidad <= 1}
              className="border border-gray-400 hover:border-black px-3 py-1 text-sm disabled:opacity-40 transition-colors"
            >
              −
            </button>
            <span className="text-base text-gray-700 min-w-[40px] text-center font-medium">
              {cantidad}
            </span>
            <button
              onClick={incrementar}
              disabled={cantidad >= producto.existencia}
              title={cantidad >= producto.existencia ? 'Stock máximo alcanzado' : ''}
              className="border border-gray-400 hover:border-black px-3 py-1 text-sm disabled:opacity-40 transition-colors"
            >
              +
            </button>
          </div>
        )}
        
        <button
          onClick={handleAgregarAlCarrito}
          disabled={producto.existencia === 0}
          className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 text-white font-normal py-2.5 px-4 transition-colors text-sm uppercase tracking-wider"
        >
          {producto.existencia === 0 ? 'Agotado' : 'Agregar al carrito'}
        </button>
      </div>
    </div>
  );
}
