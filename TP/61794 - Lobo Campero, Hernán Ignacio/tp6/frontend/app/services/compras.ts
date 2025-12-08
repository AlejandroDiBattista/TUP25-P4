import { Compra } from "@/app/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function obtenerCompras(token: string): Promise<Compra[]> {
  const response = await fetch(`${API_URL}/api/compras?token=${token}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Error al obtener compras");
  }

  return response.json();
}

export async function obtenerCompra(token: string, compraId: number): Promise<Compra> {
  const response = await fetch(`${API_URL}/api/compras/${compraId}?token=${token}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Compra no encontrada");
  }

  return response.json();
}
