// frontend/app/services/compra.ts

// 1. Añadimos CompraResumenResponse a la importación
import { CompraCreate, CompraResponse, CompraResumenResponse } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function finalizarCompra(
  compra: CompraCreate,
  token: string
): Promise<CompraResponse> {

  try {
    const response = await fetch(`${API_URL}/carrito/finalizar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, 
      },
      body: JSON.stringify(compra),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Error al finalizar la compra");
    }

    return data;

  } catch (error) {
    console.error(error);
    throw error;
  }
}

// --- 2. ¡AÑADIMOS LAS FUNCIONES FALTANTES! ---

export async function obtenerHistorialCompras(
  token: string
): Promise<CompraResumenResponse[]> {
  try {
    const response = await fetch(`${API_URL}/compras`, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      cache: 'no-store', // Datos frescos siempre
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Error al obtener el historial de compras');
    }

    return data;

  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function obtenerDetalleCompra(
  id: number,
  token: string
): Promise<CompraResponse> {
  try {
    const response = await fetch(`${API_URL}/compras/${id}`, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Error al obtener el detalle de la compra');
    }

    return data;

  } catch (error) {
    console.error(error);
    throw error;
  }
}