import { CompraDetalleResponse, CompraRequest, CompraResponse } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function crearCompra(payload: CompraRequest, token: string): Promise<CompraResponse> {
  const response = await fetch(`${API_URL}/compras`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "No se pudo registrar la compra";
    try {
      const body = await response.json();
      const detail = body?.detail ?? body?.message;
      if (typeof detail === "string" && detail.trim() !== "") {
        message = detail;
      }
    } catch {
      let mensaje = "No se pudo registrar la compra";
    }

    throw new Error(message);
  }

  return response.json() as Promise<CompraResponse>;
}

export async function listarCompras(token: string): Promise<CompraDetalleResponse[]> {
  const response = await fetch(`${API_URL}/compras`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = "No se pudo obtener el historial de compras";
    try {
      const body = await response.json();
      const detail = body?.detail ?? body?.message;
      if (typeof detail === "string" && detail.trim() !== "") {
        message = detail;
      }
    } catch {
      let mensaje = "No se pudo obtener el historial de compras";
    }

    throw new Error(message);
  }

  return response.json() as Promise<CompraDetalleResponse[]>;
}
