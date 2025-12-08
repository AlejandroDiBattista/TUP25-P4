const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface CrearProductoInput {
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  existencia: number;
}

export interface EditarProductoInput extends CrearProductoInput {
  id: number;
}

export async function crearProducto(data: CrearProductoInput) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No autenticado');
  }

  const res = await fetch(`${API_URL}/admin/productos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al crear producto');
  }

  return res.json();
}

export async function editarProducto(id: number, data: CrearProductoInput) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No autenticado');
  }

  const res = await fetch(`${API_URL}/admin/productos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al editar producto');
  }

  return res.json();
}

export async function eliminarProducto(id: number) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No autenticado');
  }

  const res = await fetch(`${API_URL}/admin/productos/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al eliminar producto');
  }

  return res.json();
}
