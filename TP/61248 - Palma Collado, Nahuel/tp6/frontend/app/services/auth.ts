import { TokenResponse, Usuario } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface RegistroPayload {
  nombre: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export async function registrarUsuario(payload: RegistroPayload): Promise<Usuario> {
  const response = await fetch(`${API_URL}/registrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let mensaje = 'Error al registrar usuario';
    try {
      const data = await response.json();
      if (typeof data.detail === 'string') {
        mensaje = data.detail;
      } else if (Array.isArray(data.detail)) {
        mensaje = data.detail.map((item: { msg?: string }) => item?.msg ?? '').filter(Boolean).join('. ');
      }
    } catch (error) {
      console.error('No se pudo interpretar el error de registro', error);
    }
    throw new Error(mensaje);
  }

  return response.json();
}

export async function iniciarSesion(payload: LoginPayload): Promise<TokenResponse> {
  const response = await fetch(`${API_URL}/iniciar-sesion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('Credenciales inválidas');
  }

  return response.json();
}

export async function obtenerPerfil(token: string): Promise<Usuario> {
  const response = await fetch(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error('No fue posible obtener el perfil');
  }

  return response.json();
}

export async function cerrarSesion(token: string): Promise<void> {
  const response = await fetch(`${API_URL}/cerrar-sesion`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error('No fue posible cerrar sesión');
  }
}
