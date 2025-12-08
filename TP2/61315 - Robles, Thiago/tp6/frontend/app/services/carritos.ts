import { Carrito } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Helper para incluir el token en el header
function getAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ------------------------------------------------------------------
// GET /carrito → obtener carrito activo
// ------------------------------------------------------------------
export const obtenerCarrito = async (): Promise<Carrito> => {
  const res = await fetch(`${API_URL}/carrito`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Error al obtener el carrito (${res.status})`);
  }

  const raw = await res.json();
  const carritoRaw = raw?.carrito ?? raw;

  // Si backend devuelve sin carrito (no debería por auto-creación), devolver vacío
  if (!carritoRaw || !carritoRaw.id) {
    return {
      id: 0,
      usuario_id: 0,
      estado: "activo",
      productos: [],
      total: 0,
    };
  }

  // Mapear items del backend → productos[] esperados por el frontend
  interface RawProducto {
    id?: number;
    titulo?: string;
    nombre?: string;
    precio?: number;
    existencia?: number;
    imagen?: string;
    categoria?: string;
    activo?: boolean;
  }
  interface RawItem {
    producto_id?: number;
    cantidad?: number;
    subtotal?: number;
    producto?: RawProducto;
    // llano (cuando backend no anida producto)
    nombre?: string;
    precio?: number;
    existencia?: number;
    imagen?: string;
    categoria?: string;
  }
  type CarritoProducto = NonNullable<Carrito["productos"]>[number];
  const productos: CarritoProducto[] = (raw.items ?? []).map(
    (it: RawItem): CarritoProducto => {
      const prod = it.producto ?? ({} as RawProducto);
      const precio =
        typeof prod.precio === "number"
          ? prod.precio
          : typeof it.precio === "number"
          ? it.precio
          : 0;
      const cantidad = typeof it.cantidad === "number" ? it.cantidad : 0;
      return {
        producto_id: it.producto_id ?? prod.id ?? 0,
        nombre: prod.titulo ?? prod.nombre ?? it.nombre ?? "",
        precio,
        cantidad,
        subtotal:
          typeof it.subtotal === "number" ? it.subtotal : precio * cantidad,
        existencia: prod.existencia ?? it.existencia,
        imagen: prod.imagen ?? it.imagen,
        // Reintroducir categoría para cálculo de IVA en el frontend
        categoria: prod.categoria ?? it.categoria,
      };
    }
  );

  // Usar totales del backend si vienen: subtotal, iva, envio, total
  const subtotal =
    typeof raw.subtotal === "number"
      ? raw.subtotal
      : productos.reduce((acc, p) => acc + (p.subtotal ?? 0), 0);
  const iva = typeof raw.iva === "number" ? raw.iva : undefined;
  const envio = typeof raw.envio === "number" ? raw.envio : undefined;
  const total =
    typeof raw.total === "number"
      ? raw.total
      : subtotal + (iva ?? 0) + (envio ?? 0);

  return {
    id: carritoRaw.id,
    usuario_id: carritoRaw.usuario_id,
    estado: carritoRaw.estado,
    productos,
    total,
    // valores auxiliares no tipados originalmente; se pueden ampliar la interfaz si se desea
    subtotal,
    iva,
    envio,
  } as Carrito & { subtotal: number; iva?: number; envio?: number };
};

// ------------------------------------------------------------------
// POST /carrito → agregar producto al carrito
// ------------------------------------------------------------------
export async function agregarProductoAlCarrito(
  producto_id: number,
  cantidad: number = 1
): Promise<{ message: string }> {
  const body = { producto_id, cantidad };
  const res = await fetch(`${API_URL}/carrito`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Error al agregar producto al carrito");
  }

  return res.json();
}

// ------------------------------------------------------------------
// DELETE /carrito/{producto_id} → quitar producto del carrito
// ------------------------------------------------------------------
export async function quitarProductoDelCarrito(
  producto_id: number
): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/carrito/${producto_id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Error al quitar producto del carrito");
  }

  return res.json();
}

// ------------------------------------------------------------------
// POST /carrito/cancelar → cancelar carrito
// ------------------------------------------------------------------
export async function cancelarCarrito(): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/carrito/cancelar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Error al cancelar el carrito");
  }

  return res.json();
}

// ------------------------------------------------------------------
// POST /carrito/finalizar → finalizar compra
// ------------------------------------------------------------------
export async function finalizarCompra(
  direccion: string,
  tarjeta: string
): Promise<{ message: string; compra_id: number; total: number }> {
  const body = { direccion, tarjeta };
  const res = await fetch(`${API_URL}/carrito/finalizar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Error al finalizar la compra");
  }

  return res.json();
}
