"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  obtenerCarrito,
  agregarAlCarrito,
  finalizarCarrito,
  eliminarDelCarrito,
  obtenerProducto,
  CarritoResumen,
  Compra
} from "../lib/api";

interface CartState {
  open: boolean;
  loading: boolean;
  data: CarritoResumen | null;
  lastAdded?: number; // producto_id para animación
  toggle: () => void;
  close: () => void;
  refresh: () => Promise<void>;
  add: (producto_id: number, cantidad?: number) => Promise<void>;
  setQty: (producto_id: number, cantidad: number) => Promise<void>;
  checkout: (direccion: string, tarjeta: string) => Promise<Compra>;
  count: number;
}

const CartContext = createContext<CartState | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CarritoResumen | null>(null);
  const [lastAdded, setLastAdded] = useState<number | undefined>();

  const computeCount = (d: CarritoResumen | null) =>
    d?.items.reduce((acc, it) => acc + it.cantidad, 0) || 0;

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const c = await obtenerCarrito();
      // Enriquecer con stock (existencia) por producto
      const itemsWithStock = await Promise.all(
        (c.items || []).map(async (it) => {
          try {
            const p = await obtenerProducto(it.producto_id);
            return { ...it, existencia: typeof p.existencia === "number" ? p.existencia : undefined };
          } catch {
            return it;
          }
        })
      );
      setData({ ...c, items: itemsWithStock });
    } catch (e) {
      // si no autenticado ignorar
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // cargar al montar si hay token
    if (typeof window !== "undefined" && localStorage.getItem("token")) {
      refresh();
    }
    // reaccionar a cambios de sesión
    const handler = () => {
      if (localStorage.getItem("token")) refresh();
      else {
        setData(null);
        setOpen(false);
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("token-changed", handler);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("token-changed", handler);
      }
    };
  }, [refresh]);

  const add = async (producto_id: number, cantidad: number = 1) => {
    await agregarAlCarrito(producto_id, cantidad);
    setLastAdded(producto_id);
    await refresh();
    // abrir automáticamente
    setOpen(true);
    // limpiar animación luego de 1.5s
    setTimeout(() => setLastAdded(undefined), 1500);
  };

  const checkout = async (direccion: string, tarjeta: string) => {
    const compra = await finalizarCarrito(direccion, tarjeta);
    await refresh();
    return compra;
  };

  const setQty = async (producto_id: number, cantidad: number) => {
    if (cantidad <= 0) {
      await eliminarDelCarrito(producto_id);
      await refresh();
      return;
    }
    const currentQty = data?.items.find(i => i.producto_id === producto_id)?.cantidad || 0;
    if (cantidad === currentQty) return;
    if (cantidad > currentQty) {
      await agregarAlCarrito(producto_id, cantidad - currentQty);
      await refresh();
      return;
    }
    // cantidad menor: no hay endpoint de decremento; rehacer item
    await eliminarDelCarrito(producto_id);
    await agregarAlCarrito(producto_id, cantidad);
    await refresh();
  };

  const value: CartState = {
    open,
    loading,
    data,
    lastAdded,
    toggle: () => setOpen(o => !o),
    close: () => setOpen(false),
    refresh,
    add,
    setQty,
    checkout,
    count: computeCount(data)
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}