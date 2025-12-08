import { Carrito, ItemCarrito } from "@/app/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function obtenerCarrito(token: string): Promise<Carrito> {
  const response = await fetch(`${API_URL}/api/carrito?token=${token}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("No hay carrito activo");
  }

  return response.json();
}

export async function agregarAlCarrito(
  token: string,
  productoId: number,
  cantidad: number
): Promise<Carrito> {
  const response = await fetch(`${API_URL}/api/carrito?token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      producto_id: productoId,
      cantidad,
    }),
  });

  if (!response.ok) {
    throw new Error("Error al agregar al carrito");
  }

  return response.json();
}

export async function eliminarDelCarrito(
  token: string,
  itemId: number
): Promise<Carrito> {
  const response = await fetch(`${API_URL}/api/carrito/item/${itemId}?token=${token}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Error al eliminar del carrito");
  }

  return response.json();
}

export async function cancelarCarrito(token: string): Promise<{ mensaje: string }> {
  const response = await fetch(`${API_URL}/api/carrito/cancelar?token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Error al cancelar carrito");
  }

  return response.json();
}

export async function finalizarCompra(
  token: string,
  direccion: string,
  tarjeta: string
): Promise<any> {
  const response = await fetch(`${API_URL}/api/carrito/finalizar?token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      direccion,
      tarjeta_numero: tarjeta,
    }),
  });

  if (!response.ok) {
    throw new Error("Error al finalizar compra");
  }

  return response.json();
}
