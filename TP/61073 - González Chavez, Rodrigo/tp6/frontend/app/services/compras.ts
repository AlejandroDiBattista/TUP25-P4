import { Compra, ItemCompra } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function obtenerCompras(token: string): Promise<Compra[]> {
    const response = await fetch(`${API_URL}/compras`, {
        "headers": {
            Authorization: `Bearer ${token}`
        }
    })

    if (!response.ok) throw new Error ("Error al obtener las compras")
    return response.json()
}

export async function obtenerCompraPorId(id: number, token: string): Promise<{compra: Compra, items: ItemCompra[]}> {
    const response = await fetch(`${API_URL}/compras/${id}`, {
        "headers": {
            Authorization: `Bearer ${token}`
        }
    })

    if (!response.ok) throw new Error ("Error al obtener el detalle de la compra")
    return response.json()
}