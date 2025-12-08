import { Producto } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function obtenerProductos(categoria?: string, buscar?: string): Promise<Producto[]> {
  const params = new URLSearchParams();
  if (categoria) params.append('categoria', categoria);
  if (buscar) params.append('buscar', buscar);
  
  const url = `${API_URL}/productos${params.toString() ? `?${params.toString()}` : ''}`;
  
  const response = await fetch(url, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error('Error al obtener productos');
  }
  
  return response.json();
}

export async function obtenerProducto(id: number): Promise<Producto> {
  const response = await fetch(`${API_URL}/productos/${id}`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error('Error al obtener el producto');
  }
  
  return response.json();
}

export async function agregarAlCarrito(producto_id: number, cantidad: number, token: string) {
  const response = await fetch(`${API_URL}/carrito`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ producto_id, cantidad })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al agregar al carrito');
  }
  
  return response.json();
}

export async function obtenerCarrito(token: string) {
  const response = await fetch(`${API_URL}/carrito`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al obtener el carrito');
  }
  
  return response.json();
}

export async function quitarDelCarrito(producto_id: number, token: string) {
  const response = await fetch(`${API_URL}/carrito/${producto_id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al quitar del carrito');
  }
  
  return response.json();
}

export async function finalizarCompra(direccion: string, tarjeta: string, token: string) {
  const response = await fetch(`${API_URL}/carrito/finalizar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ direccion, tarjeta })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al finalizar la compra');
  }
  
  return response.json();
}

export async function cancelarCompra(token: string) {
  const response = await fetch(`${API_URL}/carrito/cancelar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al cancelar la compra');
  }
  
  return response.json();
}

export async function obtenerCompras(token: string) {
  const response = await fetch(`${API_URL}/compras`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al obtener las compras');
  }
  
  return response.json();
}

export async function obtenerDetalleCompra(compra_id: number, token: string) {
  const response = await fetch(`${API_URL}/compras/${compra_id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al obtener el detalle de la compra');
  }
  
  return response.json();
}
