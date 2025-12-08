import { api } from "./api";

export async function actualizarCantidad(itemId: number, cantidad: number) {
  return api.put(`/carrito/${itemId}`, { cantidad });
}
//
