const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface UsuarioData {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  fecha_registro?: string;
}

export interface UsuarioUpdate {
  nombre: string;
  telefono?: string;
  direccion?: string;
}

export async function obtenerUsuario(token?: string): Promise<UsuarioData> {
  const tokenActual = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  
  if (!tokenActual) {
    throw new Error('No autorizado');
  }

  const response = await fetch(`${API_URL}/usuarios/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${tokenActual}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Error al obtener usuario: ${response.statusText}`);
  }

  return response.json();
}

export async function actualizarUsuario(datos: UsuarioUpdate): Promise<UsuarioData> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  if (!token) {
    throw new Error('No autorizado');
  }

  const response = await fetch(`${API_URL}/usuarios/me`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(datos),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Error al actualizar usuario: ${response.statusText}`);
  }

  return response.json();
}
