import { Producto } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/* =======================
 * Utils de autenticación
 * ======================= */

function authHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function safeText(res: Response, fallback: string) {
  try {
    return await res.text();
  } catch {
    return fallback;
  }
}

/* =======================
 * Métodos genéricos de API
 * ======================= */

async function apiGET<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    ...opts,
    headers: { ...(opts.headers || {}), ...authHeaders() },
  });
  if (!res.ok) throw new Error(await safeText(res, "Error en la solicitud"));
  return res.json();
}

async function apiForm<T>(
  path: string,
  data: Record<string, string | number | boolean | File>
): Promise<T> {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => fd.append(k, String(v)));
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    body: fd,
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(await safeText(res, "Error en la solicitud"));
  return res.json();
}

async function apiDELETE<T = unknown>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(await safeText(res, "Error en la solicitud"));
  return res.status === 204 ? (undefined as unknown as T) : res.json();
}

/* =======================
 * Productos
 * ======================= */

export async function obtenerProductos(
  q?: string,
  categoria?: string
): Promise<Producto[]> {
  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  if (categoria) qs.set("categoria", categoria);
  return apiGET<Producto[]>(`/productos?${qs.toString()}`);
}

export async function obtenerProducto(id: number): Promise<Producto> {
  return apiGET<Producto>(`/productos/${id}`);
}

/* =======================
 * Auth (login / registro)
 * ======================= */

export async function registrar(
  nombre: string,
  email: string,
  password: string
) {
  return apiForm("/registrar", { nombre, email, password });
}

export async function iniciarSesion(email: string, password: string) {
  const data = await apiForm<{
    token: string;
    usuario: { id: number; nombre: string; email: string };
  }>("/iniciar-sesion", { email, password });

  if (typeof window !== "undefined") {
    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", JSON.stringify(data.usuario));
  }

  return data;
}

export async function cerrarSesion() {
  await apiForm("/cerrar-sesion", {});
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
  }
}

/* =======================
 * Carrito
 * ======================= */

export async function verCarrito() {
  return apiGET<{
    carrito_id: number;
    estado: string;
    items: Array<{
      producto_id: number;
      nombre: string;
      cantidad: number;
      precio_unitario: number;
      subtotal: number;
    }>;
    subtotal: number;
    iva: number;
    envio: number;
    total: number;
  }>("/carrito");
}

export async function agregarAlCarrito(producto_id: number, cantidad = 1) {
  return apiForm("/carrito", { producto_id, cantidad });
}

export async function quitarDelCarrito(producto_id: number) {
  return apiDELETE(`/carrito/${producto_id}`);
}

export async function cancelarCarrito() {
  return apiForm("/carrito/cancelar", {});
}

export async function finalizarCompra(
  direccion: string,
  tarjeta: string
) {
  return apiForm<{
    ok: boolean;
    compra_id: number;
    total: number;
    envio: number;
  }>("/carrito/finalizar", { direccion, tarjeta });
}

/* =======================
 * Compras
 * ======================= */

export async function listarCompras() {
  return apiGET<
    Array<{
      id: number;
      fecha: string;
      direccion: string;
      total: number;
      envio: number;
    }>
  >("/compras");
}

export async function detalleCompra(id: number) {
  return apiGET<{
    id: number;
    fecha: string;
    direccion: string;
    total: number;
    envio: number;
    items: Array<{
      producto_id: number;
      nombre: string;
      cantidad: number;
      precio_unitario: number;
    }>;
  }>(`/compras/${id}`);
}

/* =======================
 * Exports organizados
 * ======================= */

export const Productos = {
  listar: obtenerProductos,
  detalle: obtenerProducto,
};

export const Auth = {
  login: iniciarSesion,
  registrar,
  logout: cerrarSesion,
};

export const Carrito = {
  ver: verCarrito,
  agregar: agregarAlCarrito,
  quitar: quitarDelCarrito,
  cancelar: cancelarCarrito,
  finalizar: finalizarCompra,
};

export const Compras = {
  listar: listarCompras,
  detalle: detalleCompra,
};

/* =======================
 * Utils de sesión
 * ======================= */

export function getUsuarioActual():
  | { id: number; nombre: string; email: string }
  | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("usuario");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
