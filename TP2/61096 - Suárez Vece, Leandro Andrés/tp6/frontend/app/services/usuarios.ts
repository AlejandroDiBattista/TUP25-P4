import { Token, UsuarioLogin, UsuarioRegisterResponse, UsuarioRegister } from "../types";


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function registrarUsuario(usuario: UsuarioRegister): Promise<UsuarioRegisterResponse> {
    const response = await fetch(`${API_URL}/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario),
    });
    if (!response) throw new Error('Error al registrar usuario');

    return response.json()
}

export async function iniciarSesion(usuario: UsuarioLogin): Promise<Token> {
    const response = await fetch(`${API_URL}/iniciar-sesion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario),
    });
    if (!response) throw new Error('Credenciales inválidas');
    return response.json();
}

export async function cerrarSesion(token: string): Promise<string> {
    const response = await fetch(`${API_URL}/cerrar-sesion`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response) throw new Error('Error al cerrar sesión');

    return response.json();
}