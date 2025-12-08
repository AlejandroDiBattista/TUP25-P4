'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface CarritoItem {
  producto_id: number;
  cantidad: number;
}

interface CarritoContextType {
  items: CarritoItem[];
  agregarAlCarrito: (producto_id: number, cantidad: number) => void;
  quitarDelCarrito: (producto_id: number) => void;
  vaciarCarrito: () => void;
  actualizarCantidad: (producto_id: number, cantidad: number) => void;
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

export function CarritoProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CarritoItem[]>([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Cargar carrito del localStorage al montar
  useEffect(() => {
    const savedCarrito = localStorage.getItem('carrito');
    if (savedCarrito) {
      setItems(JSON.parse(savedCarrito));
    }
  }, []);

  // Guardar carrito en localStorage cuando cambia
  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(items));
  }, [items]);

  const agregarAlCarrito = async (producto_id: number, cantidad: number) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const resp = await fetch(`${API_URL}/carrito`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ producto_id, cantidad }),
        });
        if (!resp.ok) {
          const detalle = await resp.json().catch(() => ({}));
          const msg = detalle?.detail || 'No se pudo agregar al carrito';
          console.error('Error al agregar (backend):', msg);
          if (typeof window !== 'undefined') toast.error(msg);
          return; // No actualizar estado local si backend rechaza
        }
        const data = await resp.json().catch(() => undefined);
        // Backend consolidó cantidades; reflejar en local
        setItems((prevItems) => {
          const existente = prevItems.find((item) => item.producto_id === producto_id);
          if (existente) {
            return prevItems.map((item) =>
              item.producto_id === producto_id ? { ...item, cantidad: data?.cantidad_en_carrito || (item.cantidad + cantidad) } : item
            );
          }
          return [...prevItems, { producto_id, cantidad: data?.cantidad_en_carrito || cantidad }];
        });
        toast.success('Agregado al carrito');
      } else {
        // Sin token: comportamiento local simple (no hay validación de stock en backend)
        setItems((prevItems) => {
          const existente = prevItems.find((item) => item.producto_id === producto_id);
          if (existente) {
            return prevItems.map((item) =>
              item.producto_id === producto_id ? { ...item, cantidad: item.cantidad + cantidad } : item
            );
          }
          return [...prevItems, { producto_id, cantidad }];
        });
        toast.success('Agregado al carrito');
      }
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      toast.error('Ocurrió un error al agregar al carrito');
    }
  };

  const quitarDelCarrito = async (producto_id: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.producto_id !== producto_id));
    
    // Sincronizar con backend
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${API_URL}/carrito/${producto_id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Error al quitar del carrito en backend:', error);
    }
  };

  const vaciarCarrito = () => {
    setItems([]);
  };

  const actualizarCantidad = async (producto_id: number, cantidad: number) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const resp = await fetch(`${API_URL}/carrito/${producto_id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ cantidad }),
        });
        if (!resp.ok) {
          const detalle = await resp.json().catch(() => ({}));
          const msg = detalle?.detail || 'No se pudo actualizar la cantidad';
          console.error('Error al actualizar cantidad:', msg);
          if (typeof window !== 'undefined') toast.error(msg);
          return;
        }
        const data = await resp.json().catch(() => undefined);
        if (cantidad === 0) {
          setItems(prev => prev.filter(it => it.producto_id !== producto_id));
        } else {
          setItems(prev => prev.map(it => it.producto_id === producto_id ? { ...it, cantidad: data?.cantidad || cantidad } : it));
        }
      } else {
        // Local fallback sin backend
        if (cantidad === 0) {
          setItems(prev => prev.filter(it => it.producto_id !== producto_id));
        } else {
          setItems(prev => prev.map(it => it.producto_id === producto_id ? { ...it, cantidad } : it));
        }
      }
    } catch (e) {
      console.error('Error en actualizarCantidad:', e);
    }
  };

  return (
    <CarritoContext.Provider value={{ items, agregarAlCarrito, quitarDelCarrito, vaciarCarrito, actualizarCantidad }}>
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  }
  return context;
}
