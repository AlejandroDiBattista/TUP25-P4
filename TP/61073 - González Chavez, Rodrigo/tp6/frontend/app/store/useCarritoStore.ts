import { create } from "zustand";
import { persist } from "zustand/middleware";
import { carritoService} from "../services/carrito"
import {CarritoState, CarritoResponse, ProductoCarrito} from "../types"

export const useCarritoStore = create<CarritoState>()(
    persist(
        (set, get) => ({
            productos: [],
            subtotal: 0,
            iva: 0,
            envio: 0,
            total: 0,
            cargando: false,

        /** Cargar carrito desde el backend */
        cargarCarrito: async () => {
            set({ cargando: true });
            try {
                const data = await carritoService.verCarrito();
                set({
                    productos: data.productos,
                    subtotal: data.subtotal,
                    iva: data.iva,
                    envio: data.envio,
                    total: data.total,
                });
            } catch (error) {
                console.error("Error al cargar carrito:", error);
            } finally {
                set({ cargando: false });
            }
        },

        /** Agregar nuevo producto (desde la card) */
        agregarProducto: async (producto_id) => {
            await carritoService.actualizarCantidad(producto_id, 1);
            await get().cargarCarrito();
        },

        /** Aumentar cantidad de producto (desde carrito lateral) */
        aumentarCantidad: async (producto_id) => {
            await carritoService.actualizarCantidad(producto_id, 1);
            await get().cargarCarrito();
        },

        /** Disminuir cantidad (desde carrito lateral) */
        disminuirCantidad: async (producto_id) => {
            await carritoService.actualizarCantidad(producto_id, -1);
            await get().cargarCarrito();
        },

        /** Eliminar producto completo */
        eliminarProducto: async (producto_id) => {
            await carritoService.eliminarProducto(producto_id);
            await get().cargarCarrito();
        },

        /** Cancelar carrito completo */
        cancelarCarrito: async () => {
            await carritoService.cancelarCarrito();
            set({ productos: [], subtotal: 0, iva: 0, envio: 0, total: 0 });
        },

        /** Finalizar compra */
        finalizarCompra: async (direccion, tarjeta) => {
            await carritoService.finalizarCompra(direccion, tarjeta);
            set({ productos: [], subtotal: 0, iva: 0, envio: 0, total: 0 });
        },
        }),
        { name: "carrito-store" }
    )
)
