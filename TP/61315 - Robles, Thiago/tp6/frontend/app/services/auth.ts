import { Usuario } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";


export const iniciarSesion = async (datos: Usuario) => {

  console.log("Iniciando sesión con datos:", datos);
  
  const respuesta = await fetch(`${API_URL}/iniciar-sesion`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: datos.email,
      contraseña: datos.contraseña,
    }),
  });

  if (!respuesta.ok) {
    throw new Error(`Error al iniciar sesión (${respuesta.status})`);
  }

  const data = (await respuesta.json()) as {
    access_token: string;
    token_type: string;
    usuario_id?: number;
  };

  // Guardar token y usuario_id en localStorage para su uso posterior
  if (typeof window !== "undefined") {
    localStorage.setItem("token", data.access_token);
    if (typeof data.usuario_id !== "undefined") {
      localStorage.setItem("usuarioId", String(data.usuario_id));
    }
    window.dispatchEvent(new CustomEvent("auth:changed"));
  }
  return data;
};

export const registrarUsuario = async (datos: Usuario) => {

  const respuesta = await fetch(`${API_URL}/registrar`, {

    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: datos.nombre,
      email: datos.email,
      contraseña: datos.contraseña,
    }),
  });


  if (!respuesta.ok) {
    throw new Error(`Error al registrar usuario (${respuesta.status})`);
  }

  return (await respuesta.json()) as {id: number; nombre: string; email: string }
};

export const cerrarSesion = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("usuarioId");
    window.dispatchEvent(new CustomEvent("auth:changed"));
  }
  const respuesta = fetch(`${API_URL}/cerrar-sesion`, {
    method: "POST",
  });

  if (!respuesta.ok) {
    throw new Error(`Error al cerrar sesión (${respuesta.status})`);
  }

  return { respuesta };
}