import {
  CredencialesIngreso,
  DatosRegistro,
  TokenResponse,
  UsuarioPublico,
  UsuarioSesion,
} from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function buildHeaders(token?: string) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const data = text ? (JSON.parse(text) as T) : ({} as T);

  if (!response.ok) {
    const message = (data as { detail?: string }).detail || "Error inesperado";
    throw new Error(message);
  }

  return data;
}

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) {
      return null;
    }
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload =
      typeof window === "undefined"
        ? Buffer.from(normalized, "base64").toString("utf-8")
        : atob(normalized);
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export async function registrar(datos: DatosRegistro): Promise<UsuarioPublico> {
  const response = await fetch(`${API_URL}/registrar`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(datos),
  });
  return handleResponse<UsuarioPublico>(response);
}

export async function iniciarSesion(
  credenciales: CredencialesIngreso,
): Promise<TokenResponse> {
  const response = await fetch(`${API_URL}/iniciar-sesion`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(credenciales),
  });
  return handleResponse<TokenResponse>(response);
}

export async function cerrarSesion(token: string): Promise<void> {
  const response = await fetch(`${API_URL}/cerrar-sesion`, {
    method: "POST",
    headers: buildHeaders(token),
  });
  await handleResponse(response);
}

export async function obtenerUsuarioActual(
  token: string,
  hints: Partial<UsuarioSesion> = {},
): Promise<UsuarioSesion | null> {
  const claims = decodeJwt(token);
  if (!claims || typeof claims.sub !== "string") {
    return null;
  }

  const id = Number.parseInt(claims.sub, 10);
  if (Number.isNaN(id)) {
    return null;
  }

  const nombre =
    typeof claims.nombre === "string" ? claims.nombre : hints.nombre;
  const email = typeof claims.email === "string" ? claims.email : hints.email;

  return {
    id,
    nombre,
    email,
  } satisfies UsuarioSesion;
}
