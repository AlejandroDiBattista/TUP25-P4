import { UserRegisterRequest, UserLoginRequest, Token, Usuario } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function registrar(data: UserRegisterRequest): Promise<Usuario> {
  const response = await fetch(`${API_URL}/registrar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al registrar usuario');
  }

  return response.json();
}

export async function iniciarSesion(data: UserLoginRequest): Promise<Token> {
  const response = await fetch(`${API_URL}/iniciar-sesion`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al iniciar sesión');
  }

  return response.json();
}

export async function obtenerMiUsuario(token: string): Promise<Usuario> {
  const response = await fetch(`${API_URL}/usuarios/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener usuario');
  }

  return response.json();
}

// Funciones auxiliares para gestionar el token en localStorage
export function guardarToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
  }
}

export function obtenerToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
}

export function eliminarToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
  }
}

export function estaAutenticado(): boolean {
  return obtenerToken() !== null;
}
