/**
 * Servicio de autenticación para comunicarse con el backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface RegistroData {
  nombre: string;
  email: string;
  contraseña: string;
}

export interface LoginData {
  email: string;
  contraseña: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

/**
 * Registrar un nuevo usuario
 */
export async function registrarUsuario(data: RegistroData): Promise<AuthResponse> {
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

/**
 * Iniciar sesión
 */
export async function iniciarSesion(data: LoginData): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/iniciar-sesion`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Email o contraseña incorrectos');
  }

  return response.json();
}

/**
 * Cerrar sesión
 */
export async function cerrarSesion(token: string): Promise<void> {
  const response = await fetch(`${API_URL}/cerrar-sesion`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al cerrar sesión');
  }
}

/**
 * Guardar token en localStorage
 */
export function guardarToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
}

/**
 * Obtener token de localStorage
 */
export function obtenerToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

/**
 * Eliminar token de localStorage
 */
export function eliminarToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
}

/**
 * Verificar si el usuario está autenticado
 */
export function estaAutenticado(): boolean {
  return obtenerToken() !== null;
}

/**
 * Decodificar el token JWT (básico, sin validación)
 */
export function decodificarToken(token: string): Usuario | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return {
      id: decoded.user_id,
      nombre: decoded.nombre || '',
      email: decoded.sub || '',
    };
  } catch (error) {
    console.error('Error al decodificar token:', error);
    return null;
  }
}
