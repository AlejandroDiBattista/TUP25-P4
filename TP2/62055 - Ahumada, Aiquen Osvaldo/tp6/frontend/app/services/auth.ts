// Servicio de autenticación para login, registro y cierre de sesión

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function registrar(nombre: string, email: string, password: string) {
  const response = await fetch(`${API_URL}/registrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email, password })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al registrar usuario');
  }
  return response.json();
}

export async function iniciarSesion(email: string, password: string) {
  const response = await fetch(`${API_URL}/iniciar-sesion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) {
    let errorMsg = 'Error al iniciar sesión';
    try {
      const error = await response.json();
      errorMsg = error.detail || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  const data = await response.json(); // { access_token, user }
  // Guardar token y usuario en localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.dispatchEvent(new Event('auth-updated'));
  }
  return data;
}

export function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

export function getUser() {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-updated'));
  }
}
export async function cerrarSesion(token: string) {
  const response = await fetch(`${API_URL}/cerrar-sesion`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al cerrar sesión');
  }
  return response.json();
}
