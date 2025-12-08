import { Producto } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function obtenerProductos(): Promise<Producto[]> {
  const res = await fetch(`${API_URL}/productos`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener productos");
  return res.json();
}

export async function agregarAlCarrito(usuario_id: number, producto_id: number) {
  const res = await fetch(`${API_URL}/carrito?usuario_id=${usuario_id}&producto_id=${producto_id}`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "No se pudo agregar al carrito");
  }
  return res.json();
}

export async function obtenerCarrito(usuario_id: number) {
  const res = await fetch(`${API_URL}/carrito?usuario_id=${usuario_id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo obtener el carrito");
  const data = await res.json();
  return data.items || [];
}

export async function quitarDelCarrito(usuario_id: number, producto_id: number) {
  const res = await fetch(`${API_URL}/carrito/${producto_id}?usuario_id=${usuario_id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("No se pudo quitar el producto");
  return res.json();
}

export async function cancelarCarrito(usuario_id: number) {
  const res = await fetch(`${API_URL}/carrito/cancelar?usuario_id=${usuario_id}`, { method: "POST" });
  if (!res.ok) throw new Error("No se pudo cancelar el carrito");
  return res.json();
}

export async function finalizarCompra(usuario_id: number, direccion: string, tarjeta: string) {
  const res = await fetch(`${API_URL}/carrito/finalizar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      usuario_id,
      direccion,
      tarjeta,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "No se pudo finalizar la compra");
  }
  return res.json();
}

export async function obtenerCompras(usuario_id: number) {
  const res = await fetch(`${API_URL}/compras?usuario_id=${usuario_id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo obtener el historial de compras");
  return res.json();
}

export async function obtenerDetalleCompra(compra_id: number) {
  const res = await fetch(`${API_URL}/compras/${compra_id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo obtener el detalle de la compra");
  return res.json();
}

export async function obtenerProducto(id: number) {
  const res = await fetch(`${API_URL}/productos/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Producto no encontrado");
  return res.json();
}
