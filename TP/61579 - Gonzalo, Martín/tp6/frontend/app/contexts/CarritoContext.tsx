'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { CarritoItem, Producto } from '../types';

interface CarritoContextType {
  items: CarritoItem[];
  productos: { [key: number]: Producto };
  agregarItem: (item: CarritoItem, producto: Producto) => void;
  quitarItem: (productoId: number) => void;
  vaciarCarrito: () => void;
  obtenerCantidad: (productoId: number) => number;
  obtenerTotal: () => number;
  actualizarCarrito: (items: CarritoItem[]) => void;
  agregarProducto: (producto: Producto) => void;
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CarritoItem[]>([]);
  const [productos, setProductos] = useState<{ [key: number]: Producto }>({});

  const agregarItem = (item: CarritoItem, producto: Producto) => {
    setItems((prev) => {
      const existente = prev.find((i) => i.producto_id === item.producto_id);
      if (existente) {
        return prev.map((i) =>
          i.producto_id === item.producto_id
            ? { ...i, cantidad: i.cantidad + item.cantidad }
            : i
        );
      }
      return [...prev, item];
    });
    setProductos((prev) => ({
      ...prev,
      [producto.id]: producto,
    }));
  };

  const quitarItem = (productoId: number) => {
    setItems((prev) => prev.filter((i) => i.producto_id !== productoId));
  };

  const vaciarCarrito = () => {
    setItems([]);
  };

  const obtenerCantidad = (productoId: number) => {
    const item = items.find((i) => i.producto_id === productoId);
    return item ? item.cantidad : 0;
  };

  const obtenerTotal = () => {
    return items.reduce((total, item) => {
      const producto = productos[item.producto_id];
      return total + (producto ? producto.precio * item.cantidad : 0);
    }, 0);
  };

  const actualizarCarrito = useCallback((nuevosItems: CarritoItem[]) => {
    setItems(nuevosItems);
  }, []);

  const agregarProducto = useCallback((producto: Producto) => {
    setProductos((prev) => ({
      ...prev,
      [producto.id]: producto,
    }));
  }, []);

  return (
    <CarritoContext.Provider
      value={{
        items,
        productos,
        agregarItem,
        quitarItem,
        vaciarCarrito,
        obtenerCantidad,
        obtenerTotal,
        actualizarCarrito,
        agregarProducto,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  const context = useContext(CarritoContext);
  if (context === undefined) {
    throw new Error('useCarrito debe ser usado dentro de CarritoProvider');
  }
  return context;
}
