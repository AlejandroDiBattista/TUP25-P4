"use client";

import { useCart } from '../context/CartContext';
import { Button } from './ui/button';
import { ShoppingCart } from 'lucide-react';

export default function CartButton() {
  const { openCart, cart } = useCart();

  const itemCount = cart?.productos.reduce((total, item) => total + item.cantidad, 0) || 0;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative text-gray-700 hover:text-pink-500"
      onClick={openCart}
    >
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 && (
        <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-pink-500 text-white text-xs font-bold ring-2 ring-white">
          {itemCount}
        </span>
      )}
    </Button>
  );
}