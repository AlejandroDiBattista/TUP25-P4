"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

type CartItem = {
  producto: any;
  cantidad: number;
};

type CartContextType = {
  items: CartItem[];
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
  addToCart: (productId: number, cantidad: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  decrementItem: (productId: number) => Promise<void>;
  fetchCart: () => Promise<void>;
  clearCart: () => void;
  highlightCart: boolean;
  triggerHighlight: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [highlightCart, setHighlightCart] = useState(false);
  const { user, logout } = useAuth();

  const fetchCart = async () => {
    if (!user?.token) {
      setItems([]);
      setSubtotal(0);
      return;
    }
    
    try {
      const res = await fetch("http://localhost:8000/carrito", {
        headers: { "Authorization": `Bearer ${user.token}` }
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setSubtotal(data.subtotal || 0);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId: number, cantidad: number = 1) => {
    if (!user?.token) {
      triggerHighlight();
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/carrito", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ product_id: productId, cantidad })
      });

      if (res.status === 401) {
        logout();
        return;
      }

      if (res.ok) {
        await fetchCart();
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const removeFromCart = async (productId: number) => {
    if (!user?.token) return;

    try {
      const res = await fetch(`http://localhost:8000/carrito/${productId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${user.token}` }
      });

      if (res.ok) {
        await fetchCart();
      }
    } catch (err) {
      console.error("Error removing from cart:", err);
    }
  };

  const decrementItem = async (productId: number) => {
    if (!user?.token) return;

    const item = items.find(i => i.producto.id === productId);
    if (!item) return;

    if (item.cantidad === 1) {
      await removeFromCart(productId);
    } else {
      await removeFromCart(productId);
      await addToCart(productId, item.cantidad - 1);
    }
  };

  const clearCart = () => {
    setItems([]);
    setSubtotal(0);
  };

  const triggerHighlight = () => {
    setHighlightCart(true);
    setTimeout(() => setHighlightCart(false), 2000);
  };

  const iva = subtotal * 0.21;
  const envio = subtotal > 1000 ? 0 : 50;
  const total = subtotal + iva + envio;

  return (
    <CartContext.Provider value={{ items, subtotal, iva, envio, total, addToCart, removeFromCart, decrementItem, fetchCart, clearCart, highlightCart, triggerHighlight }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
