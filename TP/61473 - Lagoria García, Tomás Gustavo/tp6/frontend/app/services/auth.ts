import { LoginCredentials, RegisterData, TokenResponse, Usuario } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Registrar un nuevo usuario
 */
export async function registrar(data: RegisterData): Promise<Usuario> {
  const response = await fetch(`${API_URL}/registrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al registrar usuario');
  }
  
  return response.json();
}

/**
 * Iniciar sesión con credenciales
 */
export async function iniciarSesion(credentials: LoginCredentials): Promise<TokenResponse> {
  const response = await fetch(`${API_URL}/iniciar-sesion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Credenciales inválidas');
  }
  
  return response.json();
}

/**
 * Cerrar sesión (invalidar token)
 */
export async function cerrarSesion(token: string): Promise<void> {
  await fetch(`${API_URL}/cerrar-sesion`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
}

// ==================== LocalStorage Helpers ====================

/**
 * Guardar token en localStorage
 */
export function guardarToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
  }
}

/**
 * Obtener token de localStorage
 */
export function obtenerToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
}

/**
 * Eliminar token de localStorage
 */
export function eliminarToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
  }
}

/**
 * Guardar usuario en localStorage
 */
export function guardarUsuario(usuario: Usuario): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }
}

/**
 * Obtener usuario de localStorage
 */
export function obtenerUsuario(): Usuario | null {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('usuario');
    return data ? JSON.parse(data) : null;
  }
  return null;
}

/**
 * Eliminar usuario de localStorage
 */
export function eliminarUsuario(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('usuario');
  }
}
