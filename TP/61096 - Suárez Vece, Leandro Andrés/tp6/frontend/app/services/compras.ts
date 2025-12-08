import { CompraDetalle, CompraExito, CompraFinalizar, CompraResumen } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function finalizarCompra(
    token: string,
    finalizar: CompraFinalizar
): Promise<CompraExito> {
    const response = await fetch(`${API_URL}/carrito/finalizar`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalizar),
    });
    if (!response) throw new Error('Error al finalizar la compra');
    return response.json();
}

export async function verCompras(token: string): Promise<CompraResumen[]> {
    const response = await fetch(`${API_URL}/compras`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    if (!response) throw new Error('Error al obtener historial de compras');
    return response.json();
}

export async function verCompraPorId(
    token: string,
    compra_id: number
): Promise<CompraDetalle> {
    const response = await fetch(`${API_URL}/compras/${compra_id}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    if (!response) throw new Error('Compra no encontrada');
    return response.json();
}