'use client'

import { Producto } from '../types';
import Image from 'next/image';
import { useCarrito } from '../context/CarritoContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ProductoCardProps {
  producto: Producto;
  onStockUpdate?: () => void;
}

export default function ProductoCard({ producto, onStockUpdate }: ProductoCardProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const { agregarProducto, items } = useCarrito();
  const { isAuthenticated, token } = useAuth();
  const router = useRouter();
  const [agregado, setAgregado] = useState(false);
  
  // Calcular cuántos productos ya están en el carrito
  const enCarrito = items.find(item => item.producto.id === producto.id)?.cantidad || 0;
  const stockDisponible = Math.max(0, producto.existencia - enCarrito);
  const puedeAgregar = stockDisponible > 0 && producto.disponible;
  
  const handleAgregarCarrito = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (!puedeAgregar) return;
    
    try {
      // Si hay token, intentar agregar al backend también
      if (token) {
        const response = await fetch(`${API_URL}/carrito`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            producto_id: producto.id,
            cantidad: 1,
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error('Error al agregar al backend:', response.status, errorData);
          // No retornamos, seguimos con el carrito local
        }
      }
      
      // Agregar al carrito local (una unidad)
      agregarProducto(producto);
      
      setAgregado(true);
      setTimeout(() => setAgregado(false), 2000);
      
      // Notificar actualización de stock
      if (onStockUpdate) {
        setTimeout(() => onStockUpdate(), 1000);
      }
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
      <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 flex-shrink-0">
        <Image
          src={`${API_URL}/${producto.imagen}`}
          alt={producto.titulo}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain p-4"
          unoptimized
        />
        {enCarrito > 0 && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            {enCarrito} en carrito
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight h-14 flex items-center">
          {producto.titulo}
        </h3>
        <p className="text-sm text-gray-700 mb-3 line-clamp-3 leading-relaxed h-16 overflow-hidden">
          {producto.descripcion}
        </p>
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            {producto.categoria}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-yellow-500 text-lg">★</span>
            <span className="text-sm font-semibold text-gray-700">{producto.valoracion || 'N/A'}</span>
          </div>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-black text-blue-600">
            ${producto.precio}
          </span>
          <div className="text-right">
            <div className={`text-xs font-bold ${stockDisponible > 0 ? 'text-green-700' : 'text-red-600'}`}>
              {stockDisponible > 0 ? `Disponible: ${stockDisponible}` : 'Sin stock'}
            </div>
            {enCarrito > 0 && (
              <div className="text-xs font-medium text-blue-600 mt-1">
                {enCarrito} en tu carrito
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-auto">
          <button
            onClick={handleAgregarCarrito}
            disabled={!puedeAgregar}
            className={`w-full py-3 px-4 rounded-lg font-bold text-sm transition-all duration-200 ${
              !puedeAgregar
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : agregado
                ? 'bg-green-600 text-white shadow-lg transform scale-105'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg hover:transform hover:scale-105'
            }`}
          >
            {!producto.disponible 
              ? 'Agotado' 
              : stockDisponible === 0
              ? 'Sin stock disponible'
              : agregado 
              ? '✓ ¡Agregado!' 
              : 'Agregar al carrito'
            }
          </button>
        </div>
      </div>
    </div>
  );
}
