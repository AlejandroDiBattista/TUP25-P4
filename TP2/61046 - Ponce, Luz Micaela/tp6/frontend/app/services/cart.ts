import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const getToken = () => Cookies.get('token');

export async function obtenerCarrito() {
  const token = getToken();
  if (!token) throw new Error('Usuario no autenticado');

  const response = await fetch(`${API_URL}/carrito`, {
    headers: { 'Authorization': `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Error al obtener el carrito');
  }

  return response.json();
}

export async function agregarAlCarrito(producto_id: number, cantidad: number) {
  const token = getToken();
  if (!token) throw new Error('Usuario no autenticado');

  const response = await fetch(`${API_URL}/carrito`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ producto_id, cantidad }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Error al agregar al carrito');
  }

  return response.json();
}

export async function quitarDelCarrito(producto_id: number) {
  const token = getToken();
  if (!token) throw new Error('Usuario no autenticado');

  const response = await fetch(`${API_URL}/carrito/${producto_id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Error al quitar del carrito');
  }

  return { success: true };
}

export async function finalizarCompra(direccion: string, tarjeta: string) {
  const token = getToken();
  if (!token) throw new Error('Usuario no autenticado');

  const response = await fetch(`${API_URL}/carrito/finalizar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ direccion, tarjeta }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Error al finalizar la compra');
  }

  return response.json();
}

export async function cancelarCompra() {
  const token = getToken();
  if (!token) throw new Error('Usuario no autenticado');

  const response = await fetch(`${API_URL}/carrito/cancelar`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Error al cancelar la compra');
  }

  return response.json();
}