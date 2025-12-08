import { api } from "./api";

export const obtenerProductos = () => api.get("/productos").then((r) => r.data);
//
