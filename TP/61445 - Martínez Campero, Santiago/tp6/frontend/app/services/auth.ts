import { AuthResponse } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function registrar(
  nombre: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/registrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al registrar');
  }

  const data = await res.json();
  localStorage.setItem('token', data.access_token);
  return data;
}

export async function iniciarSesion(
  email: string,
  password: string,
  rememberMe: boolean = false
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/iniciar-sesion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al iniciar sesión');
  }

  const data = await res.json();
  localStorage.setItem('token', data.access_token);
  
  // Si "Remember me" está activo, guardar información de sesión
  if (rememberMe) {
    const expirationTime = new Date().getTime() + (30 * 24 * 60 * 60 * 1000); // 30 días
    localStorage.setItem('tokenExpiration', expirationTime.toString());
    localStorage.setItem('userEmail', email);
  } else {
    // Limpiar si no está activo
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('userEmail');
  }
  
  return data;
}

export async function cerrarSesion(): Promise<void> {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    await fetch(`${API_URL}/auth/cerrar-sesion`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  } catch (error) {
    console.error('Error al cerrar sesión en backend:', error);
  }

  // Limpiar todo el localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('tokenExpiration');
  localStorage.removeItem('userEmail');
}

export function obtenerToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function estaAutenticado(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
}
