'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Producto } from '../types';

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

interface CartContextType {
  items: ItemCarrito[];
  agregarAlCarrito: (producto: Producto, cantidad: number) => void;
  eliminarDelCarrito: (productoId: number) => void;
  actualizarCantidad: (productoId: number, cantidad: number) => void;
  vaciarCarrito: () => void;
  totalItems: number;
  totalPrecio: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([]);

  // Cargar carrito desde localStorage al montar
  useEffect(() => {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      setItems(JSON.parse(carritoGuardado));
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(items));
  }, [items]);

  const agregarAlCarrito = (producto: Producto, cantidad: number) => {
    setItems(prevItems => {
      const itemExistente = prevItems.find(item => item.producto.id === producto.id);
      
      if (itemExistente) {
        // Si el producto ya existe, actualizar cantidad
        return prevItems.map(item =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      } else {
        // Si es nuevo, agregarlo
        return [...prevItems, { producto, cantidad }];
      }
    });
  };

  const eliminarDelCarrito = (productoId: number) => {
    setItems(prevItems => prevItems.filter(item => item.producto.id !== productoId));
  };

  const actualizarCantidad = (productoId: number, cantidad: number) => {
    if (cantidad <= 0) {
      eliminarDelCarrito(productoId);
      return;
    }
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.producto.id === productoId
          ? { ...item, cantidad }
          : item
      )
    );
  };

  const vaciarCarrito = () => {
    setItems([]);
  };

  const totalItems = items.reduce((total, item) => total + item.cantidad, 0);
  const totalPrecio = items.reduce((total, item) => total + (item.producto.precio * item.cantidad), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        agregarAlCarrito,
        eliminarDelCarrito,
        actualizarCantidad,
        vaciarCarrito,
        totalItems,
        totalPrecio,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
}
