const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface RegistroForm {
  nombre: string;
  email: string;
  password: string;
}

export async function registrarUsuario(data: RegistroForm) {
  const response = await fetch(`${API_URL}/registrar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nombre: data.nombre,
      email: data.email,
      password: data.password,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Error al registrar usuario');
  }

  return response.json();
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export async function iniciarSesion(data: LoginForm): Promise<TokenResponse> {
  const response = await fetch(`${API_URL}/iniciar-sesion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: data.email,
      password: data.password,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Error al iniciar sesión');
  }

  return response.json();
}