'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { ItemCarrito } from '../types';
import { useProductos } from '../context/ProductosContext';

interface CartItemProps {
  item: ItemCarrito;
  onUpdateQuantity: (productoId: number, cantidad: number) => void;
  onRemove: (productoId: number) => void;
  isUpdating?: boolean;
}

export function CartItem({ item, onUpdateQuantity, onRemove, isUpdating }: CartItemProps) {
  const { productos } = useProductos();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const imagenUrl = item.imagen ? `${API_URL}/${item.imagen}` : '/placeholder.jpg';
  
  // Buscar el producto para obtener su stock actual desde el backend
  const producto = productos.find(p => p.id === item.producto_id);
  const stockDisponible = producto?.existencia ?? 0;

  const precioFormateado = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(item.precio);

  const subtotalFormateado = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(item.subtotal);

  return (
    <div className="flex gap-4 py-4 border-b">
      {/* Imagen */}
      <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
        <Image
          src={imagenUrl}
          alt={item.titulo}
          fill
          className="object-cover"
          sizes="80px"
          unoptimized
        />
      </div>

      {/* Información */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm line-clamp-2 mb-1">
          {item.titulo}
        </h4>
        <p className="text-sm text-gray-600 mb-2">
          {precioFormateado} c/u
        </p>

        {/* Controles de cantidad */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => onUpdateQuantity(item.producto_id, item.cantidad - 1)}
            disabled={isUpdating || item.cantidad <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>

          <span className="text-sm font-medium w-8 text-center">
            {item.cantidad}
          </span>

          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => onUpdateQuantity(item.producto_id, item.cantidad + 1)}
            disabled={isUpdating || stockDisponible <= 0}
            title={stockDisponible <= 0 ? 'Stock agotado' : 'Aumentar cantidad'}
          >
            <Plus className="h-3 w-3" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onRemove(item.producto_id)}
            disabled={isUpdating}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="text-right flex-shrink-0">
        <p className="font-semibold text-sm">
          {subtotalFormateado}
        </p>
      </div>
    </div>
  );
}
