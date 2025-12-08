import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const getToken = () => Cookies.get('token');

export async function obtenerHistorialCompras() {
  const token = getToken();
  if (!token) throw new Error('Usuario no autenticado');

  const response = await fetch(`${API_URL}/compras`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('Sesión expirada. Por favor, inicia sesión de nuevo.');
    throw new Error('Error al obtener el historial de compras');
  }

  return response.json();
}


export async function obtenerDetalleCompra(id: string) {
  const token = getToken();
  if (!token) throw new Error('Usuario no autenticado');

  const response = await fetch(`${API_URL}/compras/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('Sesión expirada.');
    if (response.status === 404) throw new Error('Compra no encontrada.');
    throw new Error('Error al obtener el detalle de la compra');
  }

  return response.json();
}