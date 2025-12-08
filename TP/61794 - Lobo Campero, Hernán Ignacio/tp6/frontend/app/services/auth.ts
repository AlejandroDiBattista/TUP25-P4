import { SesionData, Usuario } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function registrar(nombre: string, email: string, password: string): Promise<SesionData> {
  const response = await fetch(`${API_URL}/api/registrar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nombre, email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al registrar usuario');
  }

  const data = await response.json();
  return {
    usuario: data.usuario,
    token: data.access_token,
  };
}

export async function iniciarSesion(email: string, password: string): Promise<SesionData> {
  const response = await fetch(`${API_URL}/api/iniciar-sesion`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al iniciar sesión');
  }

  const data = await response.json();
  return {
    usuario: data.usuario,
    token: data.access_token,
  };
}

export async function cerrarSesion(token: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/cerrar-sesion`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error al cerrar sesión');
  }
}

export function guardarSesion(data: SesionData): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sesion', JSON.stringify(data));
  }
}

export function obtenerSesion(): SesionData | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const sesion = localStorage.getItem('sesion');
  return sesion ? JSON.parse(sesion) : null;
}

export function limpiarSesion(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sesion');
  }
}
