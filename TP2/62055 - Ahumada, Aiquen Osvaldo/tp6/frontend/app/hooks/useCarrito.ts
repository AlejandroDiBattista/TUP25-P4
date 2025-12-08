"use client";
import { useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';

export function useCarrito() {
  const { token, isAuthenticated } = useAuth();
  const API_URL = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    []
  );

  function notifyCarritoActualizado() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('carrito-actualizado'));
    }
  }

  const agregarAlCarrito = useCallback(async (producto: any) => {
    if (!isAuthenticated) {
      throw new Error('Debes iniciar sesión para agregar productos al carrito');
    }
    if (!producto || producto.existencia <= 0) {
      throw new Error('No hay stock disponible para este producto');
    }
    const response = await fetch(`${API_URL}/carrito`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ producto_id: producto.id, cantidad: 1 })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al agregar al carrito');
    }
    const data = await response.json();
    notifyCarritoActualizado();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('compras-actualizadas'));
    }
    return data;
  }, [API_URL, isAuthenticated, token]);

  const obtenerCarrito = useCallback(async () => {
    if (!isAuthenticated) throw new Error('Debes iniciar sesión para ver el carrito');
    const response = await fetch(`${API_URL}/carrito`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al obtener el carrito');
    }
    return response.json();
  }, [API_URL, isAuthenticated, token]);

  const quitarDelCarrito = useCallback(async (producto_id: number) => {
    if (!isAuthenticated) throw new Error('Debes iniciar sesión para modificar el carrito');
    const response = await fetch(`${API_URL}/carrito/${producto_id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al quitar producto del carrito');
    }
    const data = await response.json();
    notifyCarritoActualizado();
    return data;
  }, [API_URL, isAuthenticated, token]);

  const finalizarCompra = useCallback(async () => {
    if (!isAuthenticated) throw new Error('Debes iniciar sesión para finalizar la compra');
    const response = await fetch(`${API_URL}/carrito/finalizar`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al finalizar la compra');
    }
    const data = await response.json();
    notifyCarritoActualizado();
    return data;
  }, [API_URL, isAuthenticated, token]);

  const cancelarCompra = useCallback(async () => {
    if (!isAuthenticated) throw new Error('Debes iniciar sesión para cancelar la compra');
    const response = await fetch(`${API_URL}/carrito/cancelar`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al cancelar el carrito');
    }
    const data = await response.json();
    notifyCarritoActualizado();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('compras-actualizadas'));
    }
    return data;
  }, [API_URL, isAuthenticated, token]);

  return { agregarAlCarrito, obtenerCarrito, quitarDelCarrito, finalizarCompra, cancelarCompra };
}
