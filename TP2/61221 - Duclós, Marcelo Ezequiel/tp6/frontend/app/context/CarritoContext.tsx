'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface Producto {
  id: number;
  titulo: string;
  precio: number;
  descripcion: string;
  categoria: string;
  valoracion?: number;
  existencia: number;
  imagen: string;
  disponible: boolean;
}

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

interface CarritoContextType {
  items: ItemCarrito[];
  agregarProducto: (producto: Producto, cantidad?: number) => void;
  removerProducto: (productoId: number) => Promise<void>;
  actualizarCantidad: (productoId: number, cantidad: number) => Promise<void>;
  vaciarCarrito: () => Promise<void>;
  totalItems: number;
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const { token } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const agregarProducto = (producto: Producto, cantidad: number = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.producto.id === producto.id);
      
      if (existingItem) {
        // Verificar que no exceda el stock disponible
        const nuevaCantidad = existingItem.cantidad + cantidad;
        if (nuevaCantidad > producto.existencia) {
          console.warn(`No se puede agregar más cantidad. Stock disponible: ${producto.existencia}`);
          return prevItems;
        }
        
        // Actualizar cantidad si ya existe
        return prevItems.map(item =>
          item.producto.id === producto.id
            ? { ...item, cantidad: nuevaCantidad }
            : item
        );
      } else {
        // Agregar nuevo item
        return [...prevItems, { producto, cantidad }];
      }
    });
  };

  const removerProducto = async (productoId: number) => {
    // Sincronizar con backend si hay token
    if (token) {
      try {
        const response = await fetch(`${API_URL}/carrito/${productoId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          console.error('Error al remover producto del backend:', response.status);
        }
      } catch (error) {
        console.error('Error al sincronizar remoción:', error);
      }
    }
    
    setItems(prevItems => prevItems.filter(item => item.producto.id !== productoId));
  };

  const actualizarCantidad = async (productoId: number, cantidad: number) => {
    if (cantidad <= 0) {
      removerProducto(productoId);
      return;
    }
    
    // Sincronizar con backend si hay token
    if (token) {
      try {
        const response = await fetch(`${API_URL}/carrito/${productoId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ cantidad }),
        });
        
        if (!response.ok) {
          console.error('Error al actualizar cantidad en backend:', response.status);
        }
      } catch (error) {
        console.error('Error al sincronizar cantidad:', error);
      }
    }
    
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.producto.id === productoId) {
          // Verificar que no exceda el stock disponible
          if (cantidad > item.producto.existencia) {
            console.warn(`No se puede establecer cantidad ${cantidad}. Stock disponible: ${item.producto.existencia}`);
            return item; // No cambiar la cantidad si excede el stock
          }
          return { ...item, cantidad };
        }
        return item;
      })
    );
  };

  const vaciarCarrito = async () => {
    // Sincronizar con backend si hay token
    if (token) {
      try {
        const response = await fetch(`${API_URL}/carrito/cancelar`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          console.error('Error al vaciar carrito en backend:', response.status);
        }
      } catch (error) {
        console.error('Error al sincronizar vaciado:', error);
      }
    }
    
    setItems([]);
  };

  // Cálculos
  const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.producto.precio * item.cantidad), 0);
  
  // IVA diferenciado: 21% electrónicos, 10.5% general
  const iva = items.reduce((sum, item) => {
    const esElectronico = item.producto.categoria.toLowerCase().includes('electrón');
    const porcentajeIva = esElectronico ? 0.21 : 0.105;
    return sum + (item.producto.precio * item.cantidad * porcentajeIva);
  }, 0);
  
  // Envío gratis si el subtotal > $1500, sino $200
  const envio = subtotal > 1500 ? 0 : 200;
  const total = subtotal + iva + envio;

  const value: CarritoContextType = {
    items,
    agregarProducto,
    removerProducto,
    actualizarCantidad,
    vaciarCarrito,
    totalItems,
    subtotal,
    iva,
    envio,
    total,
  };

  return (
    <CarritoContext.Provider value={value}>
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  const context = useContext(CarritoContext);
  if (context === undefined) {
    throw new Error('useCarrito debe ser usado dentro de CarritoProvider');
  }
  return context;
}