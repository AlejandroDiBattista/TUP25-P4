import { api } from "./api";
export async function getProductos(q?:string,categoria?:string){
  const r = await api.get("/productos",{ params:{ q, categoria }});
  return r.data;
}
