'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatearPrecio } from '../utils/format';

interface CartItem {
  id: number;
  producto: {
    id: number;
    nombre: string;
    precio: number;
    imagen: string;
    categoria: string;
    stock: number;
  };
  cantidad: number;
  subtotal: number;
}

interface CarritoResponse {
  items: CartItem[];
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
}

interface CartSidebarProps {
  carrito: CarritoResponse | null;
  onUpdateQuantity: (itemId: number, newQuantity: number) => void;
  onRemoveItem: (productoId: number) => void;
  onClearCart: () => void;
}

export default function CartSidebar({ 
  carrito, 
  onUpdateQuantity, 
  onRemoveItem, 
  onClearCart
}: CartSidebarProps) {
  const router = useRouter();

  const handleIncrement = (item: CartItem) => {
    // Validar que no exceda el stock disponible
    if (item.cantidad >= item.producto.stock) {
      alert(`Solo hay ${item.producto.stock} unidades disponibles de ${item.producto.nombre}`);
      return;
    }
    onUpdateQuantity(item.producto.id, item.cantidad + 1);
  };

  const handleDecrement = (item: CartItem) => {
    if (item.cantidad > 1) {
      onUpdateQuantity(item.producto.id, item.cantidad - 1);
    }
  };

  if (!carrito || carrito.items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
        <div className="text-center py-8">
          <ShoppingCart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-500">Tu carrito está vacío</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md sticky top-4">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Mi Carrito</h2>
            <Button
              onClick={onClearCart}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              Vaciar
            </Button>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto p-4 space-y-4">
          {carrito.items.map((item) => (
            <div key={item.id} className="flex gap-3 pb-4 border-b last:border-b-0">
              <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                {item.producto.imagen && (
                  <img
                    src={`http://localhost:8000/imagenes/${item.producto.imagen}`}
                    alt={item.producto.nombre}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{item.producto.nombre}</h3>
                <p className="text-blue-600 font-bold">${formatearPrecio(item.producto.precio)}</p>
                
                {/* Indicador de stock */}
                {item.cantidad >= item.producto.stock && (
                  <p className="text-xs text-orange-600 font-semibold">
                    Máximo disponible: {item.producto.stock}
                  </p>
                )}
                
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    onClick={() => handleDecrement(item)}
                    disabled={item.cantidad <= 1}
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  
                  <span className="w-8 text-center font-semibold">{item.cantidad}</span>
                  
                  <Button
                    onClick={() => handleIncrement(item)}
                    disabled={item.cantidad >= item.producto.stock}
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>

                  <Button
                    onClick={() => onRemoveItem(item.producto.id)}
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 ml-auto text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 space-y-2 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold">${formatearPrecio(carrito.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">IVA</span>
            <span className="font-semibold">${formatearPrecio(carrito.iva)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Envío</span>
            <span className="font-semibold">
              {carrito.envio === 0 ? (
                <span className="text-green-600 font-bold">GRATIS!!!</span>
              ) : (
                `$${formatearPrecio(carrito.envio)}`
              )}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-blue-600">${formatearPrecio(carrito.total)}</span>
          </div>
        </div>

        <div className="p-4 pt-0">
          <Button
            onClick={() => router.push('/checkout')}
            className="w-full"
            size="lg"
          >
            Continuar compra
          </Button>
        </div>
      </div>
    </>
  );
}
