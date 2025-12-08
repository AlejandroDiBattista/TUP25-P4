import { api } from "./api";

export async function registrar(nombre: string, email: string, password: string) {
  const r = await api.post("/registrar", { nombre, email, password });
  localStorage.setItem("token", r.data.access_token);
  localStorage.setItem("nombre", nombre); //  Guarda el nombre localmente
}

export async function login(email: string, password: string) {
  const r = await api.post("/iniciar-sesion", { email, password });
  localStorage.setItem("token", r.data.access_token);
  
  if (r.data.nombre) {
    localStorage.setItem("nombre", r.data.nombre);
  }
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("nombre"); 
}

