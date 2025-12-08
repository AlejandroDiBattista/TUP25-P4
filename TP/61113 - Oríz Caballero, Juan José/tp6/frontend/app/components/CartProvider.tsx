"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { obtenerProductos } from '../services/productos';
import { verCarrito, agregarAlCarrito, quitarDelCarrito, ajustarCantidad, finalizarCompra } from '../services/carrito';
import { getUser } from '../services/auth';

type Producto = any;

interface CartItem {
  producto: Producto;
  cantidad: number;
}

interface CartContextValue {
  productos: Producto[];
  reloadProducts: () => Promise<void>;
  cartItems: CartItem[];
  reloadCart: () => Promise<void>;
  addToCart: (product_id: number, cantidad?: number) => Promise<void>;
  removeFromCart: (product_id: number) => Promise<void>;
  setQuantity: (product_id: number, cantidad: number) => Promise<void>;
  count: number;

  finalize: (direccion: string, tarjeta: string) => Promise<any>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCart, setLoadingCart] = useState(false);

  async function reloadProducts() {
    setLoadingProducts(true);
    try {
      const p = await obtenerProductos();
      setProductos(p);
    } catch (e) {
      // ignore
    } finally {
      setLoadingProducts(false);
    }
  }

  async function reloadCart() {
    setLoadingCart(true);
    try {
      if (!getUser()) {
        setCartItems([]);
        return;
      }
      const data = await verCarrito();
      setCartItems(data.items || []);
    } catch (e) {
      setCartItems([]);
    } finally {
      setLoadingCart(false);
    }
  }

  useEffect(() => {
    // load products once
    reloadProducts();
    // load cart if logged
    reloadCart();
    // listen for auth changes (login/logout) to reload cart/products
    function onAuth() {
      reloadCart();
      reloadProducts();
    }
    window.addEventListener('authChanged', onAuth);
    return () => { window.removeEventListener('authChanged', onAuth); };
  }, []);

  // helper: compute total count
  const count = useMemo(() => (cartItems && cartItems.length) ? cartItems.reduce((s, it) => s + (it.cantidad || 0), 0) : 0, [cartItems]);

  async function addToCart(product_id: number, cantidad = 1) {
    await agregarAlCarrito(product_id, cantidad);
    // after successful add, refresh both cart and products
    await Promise.all([reloadCart(), reloadProducts()]);
  }

  async function removeFromCart(product_id: number) {
    await quitarDelCarrito(product_id);
    await Promise.all([reloadCart(), reloadProducts()]);
  }

  async function setQuantity(product_id: number, cantidad: number) {
    await ajustarCantidad(product_id, cantidad);
    await Promise.all([reloadCart(), reloadProducts()]);
  }

  async function finalize(direccion: string, tarjeta: string) {
    const resp = await finalizarCompra(direccion, tarjeta);
    await Promise.all([reloadCart(), reloadProducts()]);
    return resp;
  }

  const value: CartContextValue = {
    productos,
    reloadProducts,
    cartItems,
    reloadCart,
    addToCart,
    removeFromCart,
    setQuantity,
    finalize,
    count,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
