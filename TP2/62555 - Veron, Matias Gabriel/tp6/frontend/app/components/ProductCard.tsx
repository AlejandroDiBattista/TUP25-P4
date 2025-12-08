'use client';

import { useState } from 'react';
import { Producto } from '../types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface ProductCardProps {
  producto: Producto;
  onAddToCart: (productId: number, quantity: number) => void;
  isAuthenticated: boolean;
}

export default function ProductCard({ producto, onAddToCart, isAuthenticated }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para agregar productos al carrito');
      return;
    }

    setIsAdding(true);
    try {
      await onAddToCart(producto.id, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row">
        {/* Product Image */}
        <div className="w-full sm:w-32 h-32 bg-gray-200 flex-shrink-0">
          {producto.imagen && producto.imagen.trim() ? (
            <img
              src={`http://localhost:8000/imagenes/${producto.imagen}`}
              alt={producto.nombre}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.log('Error loading image:', e);
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span>Sin imagen</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 p-4 flex flex-col sm:flex-row justify-between">
          <div className="flex-1">
            {/* Product name */}
            <h3 className="font-semibold text-lg text-gray-800 mb-1">
              {producto.nombre}
            </h3>

            {/* Description */}
            {producto.descripcion && (
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                {producto.descripcion}
              </p>
            )}

            {/* Category */}
            {producto.categoria && (
              <p className="text-xs text-gray-500 mb-1">
                Categoría: <span className="capitalize">{producto.categoria}</span>
              </p>
            )}
          </div>

          {/* Price and Action */}
          <div className="flex flex-col sm:items-end justify-between sm:ml-4 mt-2 sm:mt-0">
            <div className="mb-2">
              <div className="text-2xl font-bold text-gray-900">
                ${producto.precio.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              {producto.stock > 0 ? (
                <div className="text-xs text-green-600 mt-1">
                  Disponible: {producto.stock}
                </div>
              ) : (
                <Badge variant="destructive" className="mt-1">
                  Sin stock
                </Badge>
              )}
            </div>

            {producto.stock > 0 && isAuthenticated && (
              <Button
                onClick={handleAddToCart}
                disabled={isAdding || producto.stock === 0}
                className="w-full sm:w-auto"
                size="sm"
              >
                {isAdding ? 'Agregando...' : 'Agregar al carrito'}
              </Button>
            )}

            {!isAuthenticated && (
              <div className="text-center text-gray-500 text-xs">
                <p>Inicia sesión para comprar</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}