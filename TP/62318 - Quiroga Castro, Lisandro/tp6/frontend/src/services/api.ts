import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
  timeout: 8000,
});

// Productos
export const obtenerProductos = () => api.get("/productos").then((r) => r.data);

// Auth
export const registrarUsuario = (payload: any) =>
  api.post("/auth/registrar", payload).then((r) => r.data);

export const loginUsuario = (email: string, contraseña: string) =>
  api.post("/auth/login", { email, contraseña }).then((r) => r.data);

// Carrito
export const obtenerCarritoBackend = (usuario_id: number) =>
  api.get(`/carrito/${usuario_id}`).then((r) => r.data);

export const agregarAlCarritoBackend = (payload: any) =>
  api.post(`/carrito/agregar`, payload).then((r) => r.data);

export const eliminarItemBackend = (item_id: number) =>
  api.delete(`/carrito/${item_id}`).then((r) => r.data);

export const vaciarCarritoBackend = (usuario_id: number) =>
  api.delete(`/carrito/vaciar/${usuario_id}`).then((r) => r.data);

export const actualizarCantidadBackend = (item_id: number, cantidad: number) =>
  api.put(`/carrito/cantidad`, null, {
    params: { item_id, cantidad },
  });
//historial
export async function getHistorial(usuario_id: number) {
  const res = await api.get(`/ventas/historial/${usuario_id}`);
  return res.data.historial; // ← esto es lo importante
}

export const finalizarCompraBackend = (
  usuario_id: number,
  payload: { direccion: string; tarjeta: string }
) => api.post(`/ventas/finalizar/${usuario_id}`, payload).then((r) => r.data);
//
