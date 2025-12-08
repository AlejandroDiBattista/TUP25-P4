import { useAuthStore } from "../store/useAuthStore";
import { CarritoResponse, MensajeResponse} from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const getToken = () => {
    const {token} = useAuthStore.getState()
    return token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
}

const authHeaders = () => {
    const token = getToken()
    if (!token) throw new Error("No hay tóken de sesión")
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    }
}

async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Error HTTP ${res.status}`);
    }
    return res.json();
}

export const carritoService = {
    async verCarrito(): Promise<CarritoResponse> {
        try {
            const res = await fetch(`${API_URL}/carrito`, {
            headers: authHeaders(),
            cache: "no-store",
        });
        return handleResponse<CarritoResponse>(res);
        } catch (error) {
            console.error("Error al enviar el token", error)
            throw error
        }
    },

    async actualizarCantidad(producto_id: number, cantidad: number): Promise<MensajeResponse> {
        try {
        const res = await fetch(`${API_URL}/carrito`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ producto_id, cantidad }),
        });
        return handleResponse<MensajeResponse>(res);
        } catch (error) {
            console.error("Error al enviar el token", error)
            throw error
        }
    },

    async eliminarProducto(producto_id: number): Promise<MensajeResponse> {
        try {
            const res = await fetch(`${API_URL}/carrito/${producto_id}`, {
            method: "DELETE",
            headers: authHeaders(),
        });
        return handleResponse<MensajeResponse>(res);
        } catch (error) {
            console.error("Error al enviar el token", error)
            throw error
        }
    },

    async cancelarCarrito(): Promise<MensajeResponse> {
        try {
            const res = await fetch(`${API_URL}/carrito/cancelar`, {
            method: "POST",
            headers: authHeaders(),
        });
        return handleResponse<MensajeResponse>(res);
        } catch(error) {
            console.error("Error al enviar token", error)
            throw error
        }
    },

    async finalizarCompra(direccion: string, tarjeta: string): Promise<MensajeResponse> {
        try {
            const res = await fetch(`${API_URL}/carrito/finalizar`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ direccion, tarjeta }),
        });
        return handleResponse<MensajeResponse>(res);
        } catch(error) {
            console.error("Error al enviar token", error)
            throw error
        }
    },
};