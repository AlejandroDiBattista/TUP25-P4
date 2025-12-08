import { Usuario } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function registrar(usuario: Usuario) {
  const res = await fetch(`${API_URL}/registrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(usuario),
  });
  return res.json();
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/iniciar-sesion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}
