'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  addCartItem,
  checkoutCart,
  clearCart,
  fetchCart,
  fetchCartTotals,
  removeCartItem,
} from "@/lib/api/cart";
import { ApiError } from "@/lib/api/client";
import type {
  Cart,
  CartItemPayload,
  CartTotals,
  CheckoutPayload,
} from "@/types/cart";
import { useAuthContext } from "./auth-context";

interface CartContextValue {
  cart: Cart | null;
  totals: CartTotals | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addItem: (payload: CartItemPayload) => Promise<void>;
  removeItem: (productoId: number) => Promise<void>;
  cancel: () => Promise<void>;
  checkout: (
    payload: CheckoutPayload,
  ) => Promise<{ message: string; compra_id: number }>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function resolveError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "No se pudo actualizar el carrito.";
}

export function CartProvider({ children }: { children: ReactNode }): JSX.Element {
  const { token } = useAuthContext();
  const [cart, setCart] = useState<Cart | null>(null);
  const [totals, setTotals] = useState<CartTotals | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadCart = useCallback(
    async (authToken: string | null) => {
      if (!authToken) {
        setCart(null);
        setTotals(null);
        return;
      }
      try {
        setLoading(true);
        const [cartData, totalsData] = await Promise.all([
          fetchCart(authToken),
          fetchCartTotals(authToken),
        ]);
        setCart(cartData);
        setTotals(totalsData);
        setError(null);
      } catch (err) {
        setError(resolveError(err));
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadCart(token);
  }, [loadCart, token]);

  const refresh = useCallback(async () => {
    await loadCart(token ?? null);
  }, [loadCart, token]);

  const addItem = useCallback(
    async (payload: CartItemPayload) => {
      if (!token) throw new Error("Debe iniciar sesión para usar el carrito.");
      setLoading(true);
      try {
        await addCartItem(token, payload);
        await loadCart(token);
      } catch (err) {
        setError(resolveError(err));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadCart, token],
  );

  const removeItemFromCart = useCallback(
    async (productoId: number) => {
      if (!token) throw new Error("Debe iniciar sesión para usar el carrito.");
      setLoading(true);
      try {
        await removeCartItem(token, productoId);
        await loadCart(token);
      } catch (err) {
        setError(resolveError(err));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadCart, token],
  );

  const cancel = useCallback(async () => {
    if (!token) throw new Error("Debe iniciar sesión para usar el carrito.");
    setLoading(true);
    try {
      await clearCart(token);
      await loadCart(token);
    } catch (err) {
      setError(resolveError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadCart, token]);

  const checkout = useCallback(
    async (payload: CheckoutPayload) => {
      if (!token) throw new Error("Debe iniciar sesión para usar el carrito.");
      setLoading(true);
      try {
        const purchaseInfo = await checkoutCart(token, payload);
        await loadCart(token);
        return purchaseInfo;
      } catch (err) {
        setError(resolveError(err));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadCart, token],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      totals,
      loading,
      error,
      refresh,
      addItem,
      removeItem: removeItemFromCart,
      cancel,
      checkout,
    }),
    [cart, totals, loading, error, refresh, addItem, removeItemFromCart, cancel, checkout],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext debe utilizarse dentro de CartProvider");
  }
  return context;
}

