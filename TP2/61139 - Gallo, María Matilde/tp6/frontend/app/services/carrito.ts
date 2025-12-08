import { api } from "./api";
export const verCarrito = async()=> (await api.get("/carrito")).data;
export const addItem = async(product_id:number,cantidad=1)=> (await api.post("/carrito",{product_id,cantidad})).data;
export const delItem = async(product_id:number)=> (await api.delete(`/carrito/${product_id}`)).data;
export const cancelar = async()=> (await api.post("/carrito/cancelar")).data;
export const finalizar = async(direccion:string, tarjeta:string)=> (await api.post("/carrito/finalizar",{direccion,tarjeta})).data;
export const compras = async()=> (await api.get("/compras")).data;
export const compraDetalle = async(id:number)=> (await api.get(`/compras/${id}`)).data;
