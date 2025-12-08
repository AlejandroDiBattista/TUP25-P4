const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface RegistroData {
  nombre: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export async function registrarUsuario(data: RegistroData): Promise<{ mensaje: string; email: string }> {
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

export async function iniciarSesion(data: LoginData): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/iniciar-sesion`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al iniciar sesión');
  }

  return response.json();
}

export async function cerrarSesion(): Promise<void> {
  const response = await fetch(`${API_URL}/cerrar-sesion`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Error al cerrar sesión');
  }
}
