"use client";

import { create } from "zustand";
import {
  obtenerCarritoBackend,
  agregarAlCarritoBackend,
  eliminarItemBackend,
  vaciarCarritoBackend,
  actualizarCantidadBackend,
  obtenerProductos,
  finalizarCompraBackend,
} from "@/services/api";

export type Producto = {
  id: number;
  titulo: string;
  precio: number;
  imagen: string;
  descripcion?: string;
  categoria?: string;
  existencia?: number;
};

export type ItemCarrito = {
  id: number;
  producto_id: number;
  cantidad: number;
  producto: Producto;
};

interface CarritoState {
  items: ItemCarrito[];
  total: number;

  cargarCarrito: (usuario_id: number) => Promise<void>;
  agregarProducto: (
    usuario_id: number,
    producto: Producto,
    cantidad?: number
  ) => Promise<void>;
  actualizarCantidad: (
    item_id: number,
    usuario_id: number,
    cantidad: number
  ) => Promise<void>;
  quitarItem: (item_id: number, usuario_id: number) => Promise<void>;
  vaciarCarrito: (usuario_id: number) => Promise<void>;

  confirmarCompra: (usuario_id: number) => Promise<string>;
}

export const useCarritoStore = create<CarritoState>((set, get) => ({
  items: [],
  total: 0,

  cargarCarrito: async (usuario_id) => {
    try {
      const carrito = await obtenerCarritoBackend(usuario_id);
      const productos = await obtenerProductos();

      const items = carrito.items.map((it: any) => {
        const p = productos.find((x: any) => x.id === it.producto_id);

        return {
          id: it.id,
          producto_id: it.producto_id,
          cantidad: it.cantidad,
          producto: p!,
        };
      });

      set({ items });

      // Calcular total
      const total = items.reduce(
        (acc, it) => acc + it.producto.precio * it.cantidad,
        0
      );
      set({ total });
    } catch (err) {
      console.error("Error cargando carrito:", err);
      set({ items: [], total: 0 });
    }
  },

  agregarProducto: async (usuario_id, producto, cantidad = 1) => {
    await agregarAlCarritoBackend({
      usuario_id,
      producto_id: producto.id,
      cantidad,
    });

    await get().cargarCarrito(usuario_id);
  },

  actualizarCantidad: async (item_id, usuario_id, cantidad) => {
    await actualizarCantidadBackend(item_id, cantidad);
    await get().cargarCarrito(usuario_id);
  },

  quitarItem: async (item_id, usuario_id) => {
    await eliminarItemBackend(item_id);
    await get().cargarCarrito(usuario_id);
  },

  vaciarCarrito: async (usuario_id) => {
    await vaciarCarritoBackend(usuario_id);
    set({ items: [], total: 0 });
  },

  confirmarCompra: async (usuario_id: number): Promise<string> => {
    const r = await finalizarCompraBackend(usuario_id, {
      direccion: "Dirección demo",
      tarjeta: "xxxx-xxxx-xxxx-4242",
    });

    await get().vaciarCarrito(usuario_id);

    return r.mensaje || "Compra realizada con éxito";
  },
}));
//
