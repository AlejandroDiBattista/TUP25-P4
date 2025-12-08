import { RegistroForm, RegistroResponse, TokenResponse } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function parseError(response: Response): Promise<string> {
  const data = await response.json().catch(() => null);
  if (data?.detail) {
    return typeof data.detail === "string"
      ? data.detail
      : JSON.stringify(data.detail);
  }
  return `Error ${response.status}`;
}

export async function registrarUsuario(payload: RegistroForm): Promise<RegistroResponse> {
  const response = await fetch(`${API_URL}/registrar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function iniciarSesion(payload: { email: string; password: string }): Promise<TokenResponse> {
  const response = await fetch(`${API_URL}/iniciar-sesion`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}
