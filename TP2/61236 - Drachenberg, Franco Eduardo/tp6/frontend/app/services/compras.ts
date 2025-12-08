import { CompraDetalle, CompraResumen } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface FetchOptions {
  signal?: AbortSignal;
}

function buildHeaders(token: string) {
  if (!token) {
    throw new Error('Se requiere un token válido para consultar el historial de compras.');
  }
  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
}

async function parseJson<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = 'No pudimos obtener tu historial de compras.';
    try {
      const data = await response.json();
      if (typeof data?.detail === 'string') {
        message = data.detail;
      }
    } catch (error) {
      if (error instanceof Error) {
        message = error.message;
      }
    }
    throw new Error(message);
  }
  return parseJson<T>(response);
}

async function authorizedFetch<T>(token: string, input: RequestInfo, init: RequestInit = {}): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      ...buildHeaders(token),
      ...init.headers,
    },
  });
  return handleResponse<T>(response);
}

export async function obtenerCompras(token: string, opciones: FetchOptions = {}): Promise<CompraResumen[]> {
  return authorizedFetch<CompraResumen[]>(token, `${API_URL}/compras`, {
    method: 'GET',
    signal: opciones.signal,
    cache: 'no-store',
  } as RequestInit);
}

export async function obtenerCompraPorId(
  token: string,
  compraId: number,
  opciones: FetchOptions = {},
): Promise<CompraDetalle> {
  return authorizedFetch<CompraDetalle>(token, `${API_URL}/compras/${compraId}`, {
    method: 'GET',
    signal: opciones.signal,
    cache: 'no-store',
  } as RequestInit);
}
