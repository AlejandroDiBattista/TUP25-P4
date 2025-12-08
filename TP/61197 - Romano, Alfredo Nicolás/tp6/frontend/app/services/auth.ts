type LoginResp = { access_token: string };

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function registrar(nombre: string, email: string, password: string) {
  const resp = await fetch(`${API_URL}/registrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email, password }),
  });
  if (!resp.ok) throw new Error('Error al registrar');
  return resp.json();
}

export async function login(email: string, password: string) {
  const resp = await fetch(`${API_URL}/iniciar-sesion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!resp.ok) throw new Error('Credenciales inválidas');
  const data = (await resp.json()) as LoginResp;
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('token', data.access_token);
  }
  // obtener usuario actual y almacenarlo
  try {
    const meResp = await fetch(`${API_URL}/me`, { headers: { Authorization: `Bearer ${data.access_token}` } });
    if (meResp.ok) {
      const user = await meResp.json();
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('user', JSON.stringify(user));
      }
    }
  } catch (e) {
    // ignore
  }
  // notify other tabs/components that auth changed
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    window.dispatchEvent(new Event('authChanged'));
  }
  return data;
}

export function logout() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  const token = localStorage.getItem('token');
  if (!token) return;
  fetch(`${API_URL}/cerrar-sesion`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {});
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    window.dispatchEvent(new Event('authChanged'));
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  return localStorage.getItem('token');
}

export function getUser() {
  // only return a user if we also have a token
  if (typeof window === 'undefined' || !window.localStorage) return null;
  const token = getToken();
  if (!token) return null;
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function authFetch(input: RequestInfo, init: RequestInit = {}) {
  const token = getToken();
  const headers = init.headers ? new Headers(init.headers as any) : new Headers();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
