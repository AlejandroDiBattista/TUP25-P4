'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  agregarItem,
  cancelarCarrito,
  finalizarCompra,
  obtenerCarrito,
  quitarItem,
} from '../services/carrito';
import { Carrito, CheckoutResponse } from '../types';
import { useAuth } from './AuthContext';

interface CartValue {
  carrito: Carrito | null;
  loading: boolean;
  error: string | null;
  isItemUpdating: (productoId: number) => boolean;
  addItem: (productoId: number, cantidad?: number) => Promise<void>;
  decreaseItem: (productoId: number) => Promise<void>;
  removeItem: (productoId: number) => Promise<void>;
  cancelar: () => Promise<void>;
  finalizar: (payload: { direccion: string; tarjeta: string }) => Promise<CheckoutResponse>;
  refresh: () => Promise<void>;
  clearError: () => void;
}

const CartContext = createContext<CartValue | undefined>(undefined);

function usePendingMap(initial?: number[]): [Set<number>, (productoId: number, pending: boolean) => void] {
  const [pending, setPending] = useState(new Set(initial));

  const toggle = useCallback((productoId: number, shouldAdd: boolean) => {
    setPending((prev) => {
      const next = new Set(prev);
      if (shouldAdd) {
        next.add(productoId);
      } else {
        next.delete(productoId);
      }
      return next;
    });
  }, []);

  return [pending, toggle];
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token, initialLoading } = useAuth();
  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingItems, togglePending] = usePendingMap();
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const fetchCarrito = useCallback(async () => {
    if (!token) {
      setCarrito(null);
      return;
    }
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const data = await obtenerCarrito(token, { signal: controller.signal });
      setCarrito(data);
    } catch (fetchError) {
      if ((fetchError as Error).name !== 'AbortError') {
        setError((fetchError as Error).message);
        setCarrito(null);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [token]);

  useEffect(() => {
    if (initialLoading) {
      return;
    }
    if (!token) {
      setCarrito(null);
      setLoading(false);
      return;
    }
    fetchCarrito();
    return () => abortControllerRef.current?.abort();
  }, [token, initialLoading, fetchCarrito]);

  const performMutation = useCallback(
    async (productoId: number | null, action: (authToken: string) => Promise<Carrito>) => {
      if (!token) {
        throw new Error('Necesitas iniciar sesión para modificar el carrito.');
      }
      if (productoId !== null) {
        togglePending(productoId, true);
      }
      setError(null);
      try {
        const data = await action(token);
        setCarrito(data);
      } catch (mutationError) {
        setError((mutationError as Error).message);
        throw mutationError;
      } finally {
        if (productoId !== null) {
          togglePending(productoId, false);
        }
      }
    },
    [token, togglePending],
  );

  const addItem = useCallback(
    async (productoId: number, cantidad = 1) => {
      await performMutation(productoId, (authToken) => agregarItem(authToken, { productoId, cantidad }));
    },
    [performMutation],
  );

  const removeItem = useCallback(
    async (productoId: number) => {
      await performMutation(productoId, (authToken) => quitarItem(authToken, productoId));
    },
    [performMutation],
  );

  const decreaseItem = useCallback(
    async (productoId: number) => {
      const item = carrito?.items.find((current) => current.producto_id === productoId);
      if (!item) {
        return;
      }
      if (item.cantidad <= 1) {
        await removeItem(productoId);
        return;
      }

      try {
        await performMutation(productoId, (authToken) => quitarItem(authToken, productoId));
        await performMutation(productoId, (authToken) =>
          agregarItem(authToken, { productoId, cantidad: item.cantidad - 1 }),
        );
      } catch (error) {
        // Si falla la reinserción, refrescamos el carrito completo para evitar estados inconsistentes.
        fetchCarrito();
        throw error;
      }
    },
    [carrito?.items, performMutation, removeItem, fetchCarrito],
  );

  const cancelar = useCallback(async () => {
    await performMutation(null, (authToken) => cancelarCarrito(authToken));
  }, [performMutation]);

  const finalizar = useCallback(
    async ({ direccion, tarjeta }: { direccion: string; tarjeta: string }) => {
      if (!token) {
        throw new Error('Necesitas iniciar sesión para finalizar la compra.');
      }
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setLoading(true);
      setError(null);
      try {
        const resultado = await finalizarCompra(token, { direccion, tarjeta }, { signal: controller.signal });
        const carritoActualizado = await obtenerCarrito(token, { signal: controller.signal });
        setCarrito(carritoActualizado);
        return resultado;
      } catch (operationError) {
        if ((operationError as Error).name !== 'AbortError') {
          setError((operationError as Error).message);
        }
        throw operationError;
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
        abortControllerRef.current = null;
      }
    },
    [token],
  );

  const value = useMemo<CartValue>(
    () => ({
      carrito,
      loading,
      error,
      addItem,
      decreaseItem,
      removeItem,
      cancelar,
      finalizar,
      refresh: fetchCarrito,
      clearError,
      isItemUpdating: (productoId: number) => pendingItems.has(productoId),
    }),
    [carrito, loading, error, addItem, decreaseItem, removeItem, cancelar, finalizar, fetchCarrito, clearError, pendingItems],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe utilizarse dentro de CartProvider');
  }
  return context;
}
