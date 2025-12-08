"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { CarritoRead } from '@/app/types';
import { getCarrito, agregarAlCarrito, quitarDelCarrito } from '@/services/api';

interface CartContextType {
    cart: CarritoRead | null;
    loading: boolean;
    error: string | null;
    addToCart: (productoId: number, cantidad: number) => Promise<void>;
    removeFromCart: (productoId: number) => Promise<void>;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [cart, setCart] = useState<CarritoRead | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCart = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (isAuthenticated && token) {
            setLoading(true);
            try {
                const cartData = await getCarrito(token);
                setCart(cartData);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        } else {
            setCart(null); // Limpiar carrito si el usuario no está autenticado
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const addToCart = async (productoId: number, cantidad: number) => {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Debes iniciar sesión para agregar productos al carrito.");
        const updatedCart = await agregarAlCarrito({ producto_id: productoId, cantidad }, token);
        setCart(updatedCart);
    };

    const removeFromCart = async (productoId: number) => {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("No estás autenticado.");
        const updatedCart = await quitarDelCarrito(productoId, token);
        setCart(updatedCart);
    };

    const clearCart = () => {
        setCart(null);
    };

    return (
        <CartContext.Provider value={{ cart, loading, error, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}