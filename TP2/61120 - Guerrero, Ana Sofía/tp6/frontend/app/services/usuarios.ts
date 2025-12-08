export interface UsuarioRegistro {
  nombre: string;
  email: string;
  contraseña: string;
}

export interface UsuarioRespuesta {
  id: number;
  nombre: string;
  email: string;
  activo: boolean;
}

declare const process: {
  env: {
    NEXT_PUBLIC_API_URL?: string;
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';


export async function registrarUsuario(datos: UsuarioRegistro): Promise<UsuarioRespuesta> {
  const response = await fetch(`${API_URL}/api/registrar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(datos),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al registrar usuario');
  }

  return response.json();
}
