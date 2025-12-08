export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function setToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token === null) {
    localStorage.removeItem('token');
  } else {
    localStorage.setItem('token', token);
  }
  // Avisar a toda la app (mismo tab) que el token cambió
  window.dispatchEvent(new Event('token-change'));
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function getMe(): Promise<{ id: number; nombre: string; email: string } | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const r = await fetch(`${API_URL}/me`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    if (!r.ok) return null;
    return r.json();
  } catch {
    return null;
  }
}
