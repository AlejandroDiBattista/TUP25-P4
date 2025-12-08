'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Carrito } from '../types';
import * as carritoService from '../services/carrito';
import { useAuth } from './AuthContext';
import { useProductos } from './ProductosContext';

interface CarritoContextType {
  carrito: Carrito | null;
  loading: boolean;
  error: string | null;
  agregar: (producto_id: number, cantidad?: number) => Promise<Carrito>;
  quitar: (producto_id: number) => Promise<Carrito>;
  cancelar: () => Promise<void>;
  finalizar: (direccion: string, tarjeta: string) => Promise<any>;
  recargar: () => Promise<void>;
  cantidadTotal: number;
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

export function CarritoProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { actualizarStock } = useProductos();
  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar el carrito desde la API
   */
  const cargarCarrito = useCallback(async () => {
    if (!isAuthenticated) {
      setCarrito(null);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await carritoService.obtenerCarrito();
      setCarrito(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar carrito';
      setError(message);
      console.error('Error al cargar carrito:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Cargar carrito al montar o cuando cambie la autenticación
  useEffect(() => {
    if (isAuthenticated) {
      cargarCarrito();
    } else {
      setCarrito(null);
    }
  }, [isAuthenticated, cargarCarrito]);

  /**
   * Agregar producto al carrito
   */
  const agregar = async (producto_id: number, cantidad: number = 1): Promise<Carrito> => {
    try {
      setLoading(true);
      setError(null);
      const data = await carritoService.agregarAlCarrito(producto_id, cantidad);
      setCarrito(data);
      
      // Actualizar stock localmente (restar la cantidad agregada)
      actualizarStock(producto_id, -cantidad);
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al agregar producto';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Quitar producto del carrito
   */
  const quitar = async (producto_id: number): Promise<Carrito> => {
    try {
      setLoading(true);
      setError(null);
      
      // Guardar la cantidad que tenía para devolver al stock
      const item = carrito?.items.find(i => i.producto_id === producto_id);
      const cantidadDevuelta = item?.cantidad || 0;
      
      const data = await carritoService.quitarDelCarrito(producto_id);
      setCarrito(data);
      
      // Actualizar stock localmente (sumar la cantidad devuelta)
      if (cantidadDevuelta > 0) {
        actualizarStock(producto_id, cantidadDevuelta);
      }
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al quitar producto';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancelar carrito (vaciar)
   */
  const cancelar = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Devolver stock de todos los items antes de cancelar
      if (carrito?.items) {
        carrito.items.forEach(item => {
          actualizarStock(item.producto_id, item.cantidad);
        });
      }
      
      await carritoService.cancelarCarrito();
      await cargarCarrito(); // Recargar carrito vacío
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cancelar carrito';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Finalizar compra
   */
  const finalizar = async (direccion: string, tarjeta: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await carritoService.finalizarCompra(direccion, tarjeta);
      setCarrito(null); // Limpiar carrito después de finalizar
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al finalizar compra';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener cantidad total de items en el carrito
   */
  const cantidadTotal = carrito?.items.reduce((acc, item) => acc + item.cantidad, 0) || 0;

  return (
    <CarritoContext.Provider
      value={{
        carrito,
        loading,
        error,
        agregar,
        quitar,
        cancelar,
        finalizar,
        recargar: cargarCarrito,
        cantidadTotal,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  const context = useContext(CarritoContext);
  if (context === undefined) {
    throw new Error('useCarrito debe ser usado dentro de un CarritoProvider');
  }
  return context;
}
