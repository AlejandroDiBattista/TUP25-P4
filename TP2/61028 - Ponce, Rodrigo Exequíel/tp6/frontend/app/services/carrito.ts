// frontend/app/services/carrito.ts
import { ItemCarritoCreate, ItemCarritoResponse, CarritoResponse } from "../types"; // <-- ¡AÑADIDO CarritoResponse!

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function agregarAlCarrito(
  item: ItemCarritoCreate,
  token: string
): Promise<ItemCarritoResponse> {
  // ... (tu función existente está perfecta) ...
  try {
    const response = await fetch(`${API_URL}/carrito`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, 
      },
      body: JSON.stringify(item),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Error al agregar el producto al carrito");
    }

    return data;

  } catch (error) {
    console.error(error);
    throw error;
  }
}

// --- ¡AÑADE ESTA NUEVA FUNCIÓN! ---

export async function obtenerCarrito(
  token: string
): Promise<CarritoResponse> {
  
  try {
    const response = await fetch(`${API_URL}/carrito`, {
      method: "GET", // <-- Método GET
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // Necesita el token
      },
      cache: 'no-store', // <-- No queremos caché, siempre datos frescos
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Error al obtener el carrito");
    }

    return data;

  } catch (error) {
    console.error(error);
    throw error;
  }
}