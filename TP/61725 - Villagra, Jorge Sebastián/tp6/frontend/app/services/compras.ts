const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function authHeaders() {
  const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!t) throw new Error("401 No autenticado");
  return { Authorization: `Bearer ${t}`, "Content-Type": "application/json" };
}

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(API + path, { ...init, headers: { ...(init?.headers||{}), ...authHeaders() } });
  if (!res.ok) {
    let detail = "";
    try { detail = (await res.json()).detail || ""; } catch {}
    const err: any = new Error(detail || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export const comprasUsuario = () => authFetch<any[]>('/compras');
export const compraPorId = (id: number) => authFetch<any>(`/compras/${id}`);

export function confirmarCompra(payload: { nombre: string; direccion: string; telefono: string; tarjeta: string }) {
  return authFetch<{ ok: boolean; compra_id: number }>("/carrito/finalizar", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}