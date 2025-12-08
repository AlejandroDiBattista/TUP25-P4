// frontend/app/services/carrito.ts
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Función auxiliar para obtener el token de autenticación
function getAuthHeaders() {
  const token = Cookies.get('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

// Tipos
export interface CarritoResponse {
  items: CarritoItem[];
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
}

export interface CarritoItem {
  id: number;
  producto: {
    id: number;
    nombre: string;
    precio: number;
    imagen: string;
    categoria: string;
    stock: number;
  };
  cantidad: number;
  subtotal: number;
}

export interface FinalizarCompraData {
  direccion: string;
  tarjeta: string;
}

export async function obtenerCarrito(): Promise<CarritoResponse> {
  try {
    const response = await fetch(`${API_URL}/carrito/`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener carrito');
    }

    return response.json();
  } catch (error) {
    console.error('Error obteniendo carrito:', error);
    throw error;
  }
}

export async function agregarAlCarrito(productoId: number, cantidad: number): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/carrito/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        producto_id: productoId,
        cantidad: cantidad,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al agregar al carrito');
    }
  } catch (error) {
    console.error('Error agregando al carrito:', error);
    throw error;
  }
}

export async function eliminarDelCarrito(productoId: number): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/carrito/${productoId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al eliminar del carrito');
    }
  } catch (error) {
    console.error('Error eliminando del carrito:', error);
    throw error;
  }
}

export async function actualizarCantidad(productoId: number, cantidad: number): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/carrito/${productoId}?cantidad=${cantidad}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al actualizar cantidad');
    }
  } catch (error) {
    console.error('Error actualizando cantidad:', error);
    throw error;
  }
}

export async function vaciarCarrito(): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/carrito/vaciar`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al vaciar carrito');
    }
  } catch (error) {
    console.error('Error vaciando carrito:', error);
    throw error;
  }
}

export async function finalizarCompra(data: FinalizarCompraData): Promise<{ ok: boolean; compra_id: number; total: number }> {
  try {
    const response = await fetch(`${API_URL}/carrito/finalizar`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al finalizar compra');
    }

    return response.json();
  } catch (error) {
    console.error('Error finalizando compra:', error);
    throw error;
  }
}