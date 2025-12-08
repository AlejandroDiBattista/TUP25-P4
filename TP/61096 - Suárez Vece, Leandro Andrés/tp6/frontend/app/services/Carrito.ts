import { CarritoRead, message } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function verCarrito(token: string): Promise<CarritoRead[]> {
    const response = await fetch(`${API_URL}/carrito`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    if (!response) throw new Error('Error al obtener el carrito');
    return response.json();
}

export async function agregarAlCarrito(
    token: string,
    producto_id: number,
    cantidad: number
): Promise<message> {
    const response = await fetch(`${API_URL}/carrito`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ producto_id, cantidad }),
    });
    if (!response) {
        localStorage.clear();
        throw new Error('Error al agregar producto al carrito');
    }
    return response.json();

}

export async function quitarDelCarrito(
    token: string,
    producto_id: number
): Promise<message> {
    const response = await fetch(`${API_URL}/carrito/${producto_id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response) {
        localStorage.clear();
        throw new Error('Error al quitar producto del carrito');
    }
    return response.json()
}

export async function cancelarCompra(token: string): Promise<message> {
    const response = await fetch(`${API_URL}/carrito/cancelar`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    if (!response) {
        localStorage.clear();
        throw new Error('Error al cancelar la compra');
    }

    return response.json()

}
