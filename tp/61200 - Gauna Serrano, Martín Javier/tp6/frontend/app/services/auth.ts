/**
 * Servicio de autenticación para el frontend
 * Maneja registro, login, logout y gestión del token JWT
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const TOKEN_KEY = 'token';
const NOMBRE_KEY = 'usuario_nombre';
const EMAIL_KEY = 'usuario_email';

export interface Usuario {
  nombre: string;
  email: string;
}

export interface RegistroData {
  nombre: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  nombre: string;
  email: string;
}

export interface UsuarioActual {
  nombre: string;
  email: string;
}

/* ============================
   REGISTRAR USUARIO
============================ */
export async function registrarUsuario(data: RegistroData): Promise<{ mensaje: string }> {
  const response = await fetch(`${API_URL}/registrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Error al registrar usuario');
  }

  return response.json();
}


/* ============================
   INICIAR SESION
============================ */
export async function iniciarSesion(data: LoginData): Promise<TokenResponse> {
  const response = await fetch(`${API_URL}/iniciar-sesion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Error al iniciar sesión');
  }

  const tokenData: TokenResponse = await response.json();

  // Guardar token localmente
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, tokenData.access_token);
    localStorage.setItem(NOMBRE_KEY, tokenData.nombre);
    localStorage.setItem(EMAIL_KEY, tokenData.email);
  }

  return tokenData;
}


/* ============================
   CERRAR SESION
============================ */
export async function cerrarSesion(): Promise<void> {
  const token = getToken();

  if (token) {
    try {
      await fetch(`${API_URL}/cerrar-sesion`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (_) {
      // No importa si falla, igual limpiamos localStorage
    }
  }

  // Eliminar datos
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(NOMBRE_KEY);
    localStorage.removeItem(EMAIL_KEY);
  }
}


/* ============================
   TOKEN Y HEADERS
============================ */
export function getToken(): string | null {
  if (typeof window !== 'undefined') return localStorage.getItem(TOKEN_KEY);
  return null;
}

export function estaAutenticado(): boolean {
  return getToken() !== null;
}

export function getAuthHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}


/* ============================
   DATOS LOCALES
============================ */
export function obtenerNombreAlmacenado(): string | null {
  if (typeof window !== 'undefined') return localStorage.getItem(NOMBRE_KEY);
  return null;
}

export function obtenerEmailAlmacenado(): string | null {
  if (typeof window !== 'undefined') return localStorage.getItem(EMAIL_KEY);
  return null;
}


/* ============================
   USUARIO ACTUAL
============================ */
export async function obtenerUsuarioActual(): Promise<UsuarioActual> {
  const response = await fetch(`${API_URL}/usuarios/me`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });

  if (!response.ok) throw new Error('No se pudo obtener el usuario');

  const data: UsuarioActual = await response.json();

  // Guardar nombre/email localmente
  if (typeof window !== 'undefined') {
    localStorage.setItem(NOMBRE_KEY, data.nombre);
    localStorage.setItem(EMAIL_KEY, data.email);
  }

  return data;
}
