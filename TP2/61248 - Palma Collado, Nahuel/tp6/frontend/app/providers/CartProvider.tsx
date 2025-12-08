'use client';

import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  agregarAlCarrito,
  cancelarCarrito,
  finalizarCarrito,
  obtenerCarrito,
  quitarDelCarrito
} from '../services/cart';
import type { CarritoDetalle, CompraFinalizada } from '../types';
import { useAuth } from './AuthProvider';

interface CartContextValue {
  carrito: CarritoDetalle | null;
  cargando: boolean;
  refrescar: () => Promise<void>;
  agregar: (productoId: number, cantidad?: number) => Promise<void>;
  quitar: (productoId: number) => Promise<void>;
  cancelar: () => Promise<void>;
  finalizar: (payload: { direccion: string; tarjeta: string }) => Promise<CompraFinalizada>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [carrito, setCarrito] = useState<CarritoDetalle | null>(null);
  const [cargando, setCargando] = useState(false);

  const ensureToken = useCallback(() => {
    if (!token) {
      throw new Error('El usuario debe iniciar sesión');
    }
    return token;
  }, [token]);

  const refrescar = useCallback(async () => {
    const activeToken = ensureToken();
    setCargando(true);
    try {
      const data = await obtenerCarrito(activeToken);
      setCarrito(data);
    } finally {
      setCargando(false);
    }
  }, [ensureToken]);

  const agregar = useCallback(async (productoId: number, cantidad = 1) => {
    const activeToken = ensureToken();
    setCargando(true);
    try {
      const data = await agregarAlCarrito(activeToken, { producto_id: productoId, cantidad });
      setCarrito(data);
    } finally {
      setCargando(false);
    }
  }, [ensureToken]);

  const quitar = useCallback(async (productoId: number) => {
    const activeToken = ensureToken();
    setCargando(true);
    try {
      const data = await quitarDelCarrito(activeToken, productoId);
      setCarrito(data);
    } finally {
      setCargando(false);
    }
  }, [ensureToken]);

  const cancelar = useCallback(async () => {
    const activeToken = ensureToken();
    setCargando(true);
    try {
      const data = await cancelarCarrito(activeToken);
      setCarrito(data);
    } finally {
      setCargando(false);
    }
  }, [ensureToken]);

  const finalizar = useCallback(async (payload: { direccion: string; tarjeta: string }) => {
    const activeToken = ensureToken();
    setCargando(true);
    try {
      const data = await finalizarCarrito(activeToken, payload);
      setCarrito(data.carrito);
      return data;
    } finally {
      setCargando(false);
    }
  }, [ensureToken]);

  const value = useMemo(
    () => ({ carrito, cargando, refrescar, agregar, quitar, cancelar, finalizar }),
    [carrito, cargando, refrescar, agregar, quitar, cancelar, finalizar]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
}
