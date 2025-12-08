'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Producto } from '../types';
import * as productosService from '../services/productos';

interface ProductosContextType {
  productos: Producto[];
  loading: boolean;
  error: string | null;
  actualizarStock: (productoId: number, cambio: number) => void;
  recargarProductos: () => Promise<void>;
}

const ProductosContext = createContext<ProductosContextType | undefined>(undefined);

export function ProductosProvider({ children }: { children: ReactNode }) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar productos desde la API
   */
  const cargarProductos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productosService.obtenerProductos();
      setProductos(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar productos';
      setError(message);
      console.error('Error al cargar productos:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualizar stock de un producto localmente
   * @param productoId - ID del producto
   * @param cambio - Cantidad a cambiar (negativo para restar, positivo para sumar)
   */
  const actualizarStock = (productoId: number, cambio: number) => {
    setProductos(prevProductos =>
      prevProductos.map(producto =>
        producto.id === productoId
          ? { ...producto, existencia: Math.max(0, producto.existencia + cambio) }
          : producto
      )
    );
  };

  return (
    <ProductosContext.Provider
      value={{
        productos,
        loading,
        error,
        actualizarStock,
        recargarProductos: cargarProductos,
      }}
    >
      {children}
    </ProductosContext.Provider>
  );
}

export function useProductos() {
  const context = useContext(ProductosContext);
  if (context === undefined) {
    throw new Error('useProductos debe ser usado dentro de un ProductosProvider');
  }
  return context;
}
