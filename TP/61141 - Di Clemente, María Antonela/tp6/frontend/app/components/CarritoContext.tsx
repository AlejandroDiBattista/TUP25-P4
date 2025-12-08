"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { Producto } from "../types";

interface ItemCarrito extends Producto {
  cantidad: number;
}

interface CarritoContextType {
  cartItems: ItemCarrito[];
  agregarAlCarrito: (producto: Producto) => void;
  eliminarDelCarrito: (id: number) => void;
  vaciarCarrito: () => void;
  guardarCarritoEnLocalStorage: () => void;
  cargarCarritoDesdeLocalStorage: () => void;
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

export function CarritoProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<ItemCarrito[]>([]);

  // Cargar carrito cuando se abre la página
  useEffect(() => {
    cargarCarritoDesdeLocalStorage();
  }, []);

  // Agregar producto y guardar en localStorage
const agregarAlCarrito = (producto: Producto) => {
  setCartItems((prev) => {
    const existente = prev.find((p) => p.id === producto.id) as ItemCarrito | undefined;

    // stock disponible (usar la propiedad que corresponda: existencia o stock)
    const disponible = (producto as any).existencia ?? (producto as any).stock ?? 0;

    if (existente) {
      const nuevaCantidad = existente.cantidad + 1;
      if (nuevaCantidad > disponible) {
        alert(`No hay stock suficiente. Disponible: ${disponible}`);
        return prev;
      }
      const nuevo = prev.map((p) =>
        p.id === producto.id ? { ...p, cantidad: nuevaCantidad } : p
      );
      localStorage.setItem("carrito", JSON.stringify(nuevo));
      return nuevo;
    } else {
      if (1 > disponible) {
        alert(`Producto agotado`);
        return prev;
      }
      const nuevo = [...prev, { ...producto, cantidad: 1 }];
      localStorage.setItem("carrito", JSON.stringify(nuevo));
      return nuevo;
    }
  });
};

  const eliminarDelCarrito = (id: number) => {
  setCartItems((prev) => {
    const nuevo = prev
      .map((p) => {
        if (p.id === id) {
          if (p.cantidad > 1) {
            return { ...p, cantidad: p.cantidad - 1 };
          }
          return null;
        }
        return p;
      })
      .filter((p): p is ItemCarrito => p !== null);

    localStorage.setItem("carrito", JSON.stringify(nuevo));
    return nuevo;
  });
};


  const vaciarCarrito = () => {
    setCartItems([]);
    localStorage.removeItem("carrito");
  };

  // Guardar carrito en localStorage
  const guardarCarritoEnLocalStorage = () => {
    localStorage.setItem("carrito", JSON.stringify(cartItems));
  };

  // Cargar carrito desde localStorage
  const cargarCarritoDesdeLocalStorage = () => {
    const guardado = localStorage.getItem("carrito");
    if (guardado) {
      setCartItems(JSON.parse(guardado));
    }
  };

  return (
    <CarritoContext.Provider
      value={{
        cartItems,
        agregarAlCarrito,
        eliminarDelCarrito,
        vaciarCarrito,
        guardarCarritoEnLocalStorage,
        cargarCarritoDesdeLocalStorage,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) throw new Error("useCarrito debe usarse dentro de CarritoProvider");
  return context;
};
