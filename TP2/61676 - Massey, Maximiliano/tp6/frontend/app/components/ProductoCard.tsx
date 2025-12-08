'use client';

import { Producto } from '../types';
import Image from 'next/image';
import useCartStore from '../store/cart';
import { useState } from 'react';

interface ProductoCardProps {
  producto: Producto;
}

export default function ProductoCard({ producto }: ProductoCardProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const { addItem, items } = useCartStore();
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Calcular stock disponible (stock total - cantidad en carrito)
  const cantidadEnCarrito = items.find(item => item.id === producto.id)?.cantidad || 0;
  const stockDisponible = producto.existencia - cantidadEnCarrito;
  const sinStock = stockDisponible <= 0;

  const handleAddToCart = async () => {
    if (sinStock) {
      alert(`No hay más stock disponible de este producto. Ya tienes ${cantidadEnCarrito} en el carrito.`);
      return;
    }

    setLoading(true);
    try {
      await addItem(producto, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (error: any) {
      console.error('Error al agregar al carrito:', error);
      const errorMessage = error?.message || 'Error al agregar al carrito';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all ${
      sinStock ? 'opacity-75 border-2 border-red-300' : ''
    }`}>
      <div className="relative h-64 bg-gray-100">
        <Image
          src={producto.imagen.startsWith('http') ? producto.imagen : `${API_URL}/${producto.imagen}`}
          alt={producto.nombre || producto.titulo || "Imagen del producto"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-contain p-4 transition-all ${sinStock ? 'grayscale blur-[1px]' : ''}`}
          unoptimized
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/300x300/f3f4f6/9ca3af?text=Producto';
          }}
        />
        {/* Badge AGOTADO */}
        {sinStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-red-600 text-white px-8 py-4 rounded-lg shadow-2xl transform rotate-[-15deg] border-4 border-white">
              <span className="text-2xl font-bold tracking-wider">AGOTADO</span>
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {producto.nombre || producto.titulo}
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
        <div className="flex justify-between items-center mb-3">
          <span className="text-2xl font-bold text-blue-600">
            ${producto.precio}
          </span>
          <div className="text-right">
            <span className={`text-xs font-semibold ${
              stockDisponible === 0 ? 'text-red-600' : 
              stockDisponible <= 3 ? 'text-orange-600' : 
              'text-green-600'
            }`}>
              {stockDisponible === 0 ? 'Sin stock' : `Disponible: ${stockDisponible}`}
            </span>
            {cantidadEnCarrito > 0 && (
              <div className="text-xs text-blue-600 mt-0.5">
                En carrito: {cantidadEnCarrito}
              </div>
            )}
          </div>
        </div>
        
        {/* Botón Agregar al Carrito o Estado Agotado */}
        <button
          onClick={handleAddToCart}
          disabled={sinStock || loading}
          className={`w-full py-2 rounded-lg font-semibold transition-all ${
            sinStock
              ? 'bg-red-500 text-white cursor-not-allowed hover:bg-red-600'
              : loading
              ? 'bg-gray-400 text-white cursor-wait'
              : added
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {sinStock
            ? '❌ AGOTADO' 
            : loading 
            ? '⏳ Agregando...'
            : added 
            ? '✓ Agregado!' 
            : '🛒 Agregar al Carrito'}
        </button>
      </div>
    </div>
  );
}
