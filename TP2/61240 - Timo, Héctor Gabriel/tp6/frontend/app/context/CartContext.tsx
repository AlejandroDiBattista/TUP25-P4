"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { CarritoRead } from '@/types';
import { getCarrito, agregarAlCarrito, quitarDelCarrito, cancelarCompra } from '@/services/api';

interface CartContextType {
    cart: CarritoRead | null;
    loading: boolean;
    error: string | null;
    addToCart: (productoId: number, cantidad: number) => Promise<void>;
    removeFromCart: (productoId: number) => Promise<void>;
    increaseQuantity: (productoId: number) => Promise<void>;
    decreaseQuantity: (productoId: number) => Promise<void>;
    cancelCart: () => Promise<void>;
    fetchCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
    children: ReactNode;
    onProductUpdate?: () => void; // Hacemos que la función sea opcional
}
export function CartProvider({ children, onProductUpdate }: CartProviderProps) {
    const { isAuthenticated, user } = useAuth();
    const [cart, setCart] = useState<CarritoRead | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCart = useCallback(async () => {
        if (isAuthenticated && user) {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error("No autenticado");
                const cartData = await getCarrito(token);
                setCart(cartData);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        } else {
            setCart(null);
            setLoading(false);
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const updateCart = async (action: Promise<CarritoRead>) => {
        try {
            const updatedCart = await action;
            setCart(updatedCart);
            if (onProductUpdate) {
                onProductUpdate(); // Llamamos a la función para refrescar los productos
            }
        } catch (err: any) {
            setError(err.message);
            // En lugar de una alerta, puedes usar un sistema de notificaciones más elegante
            console.error("Error al actualizar el carrito:", err.message);
            throw err; // Relanzar el error para que el componente que llama pueda manejarlo
        }
    };

    const addToCart = (productoId: number, cantidad: number) => {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("No autenticado");
        return updateCart(agregarAlCarrito({ producto_id: productoId, cantidad }, token));
    };
    
    const removeFromCart = (productoId: number) => {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("No autenticado");
        return updateCart(quitarDelCarrito(productoId, token));
    };
    
    const cancelCart = async () => {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("No autenticado");
        await cancelarCompra(token);
        await fetchCart(); // Vuelve a cargar el carrito, que ahora estará vacío
    };
    
    const increaseQuantity = (productoId: number) => addToCart(productoId, 1);

    const decreaseQuantity = (productoId: number) => {
        const item = cart?.items.find(i => i.producto.id === productoId);
        if (item && item.cantidad > 1) {
            return addToCart(productoId, -1); // Usamos el mismo endpoint con cantidad negativa
        } else {
            return removeFromCart(productoId); // Si la cantidad es 1, lo eliminamos
        }
    };

    return (
        <CartContext.Provider value={{ cart, loading, error, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, cancelCart, fetchCart }}>
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