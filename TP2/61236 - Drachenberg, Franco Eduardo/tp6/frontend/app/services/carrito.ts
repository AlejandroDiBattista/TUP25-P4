import { Carrito, CheckoutPayload, CheckoutResponse } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type JsonValue = Record<string, unknown> | Array<unknown>;

interface FetchOptions {
  signal?: AbortSignal;
}

interface AgregarItemPayload {
  productoId: number;
  cantidad?: number;
}

function buildHeaders(token: string, hasBody = false) {
  if (!token) {
    throw new Error('Se requiere un token válido para operar sobre el carrito.');
  }
  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
  };
  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }
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
    let message = 'Error al comunicarse con el servicio de carrito.';
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

async function authorizedFetch<T>(
  token: string,
  input: RequestInfo,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      ...buildHeaders(token, Boolean(init?.body)),
      ...init?.headers,
    },
  });
  return handleResponse<T>(response);
}

export async function obtenerCarrito(
  token: string,
  opciones: FetchOptions = {},
): Promise<Carrito> {
  return authorizedFetch<Carrito>(token, `${API_URL}/carrito`, {
    method: 'GET',
    signal: opciones.signal,
    cache: 'no-store',
  } as RequestInit);
}

export async function agregarItem(
  token: string,
  payload: AgregarItemPayload,
  opciones: FetchOptions = {},
): Promise<Carrito> {
  const body: JsonValue = {
    producto_id: payload.productoId,
    cantidad: payload.cantidad ?? 1,
  };

  return authorizedFetch<Carrito>(token, `${API_URL}/carrito`, {
    method: 'POST',
    signal: opciones.signal,
    body: JSON.stringify(body),
  });
}

export async function quitarItem(
  token: string,
  productoId: number,
  opciones: FetchOptions = {},
): Promise<Carrito> {
  return authorizedFetch<Carrito>(token, `${API_URL}/carrito/${productoId}`, {
    method: 'DELETE',
    signal: opciones.signal,
  });
}

export async function cancelarCarrito(
  token: string,
  opciones: FetchOptions = {},
): Promise<Carrito> {
  return authorizedFetch<Carrito>(token, `${API_URL}/carrito/cancelar`, {
    method: 'POST',
    signal: opciones.signal,
  });
}

export async function finalizarCompra(
  token: string,
  payload: CheckoutPayload,
  opciones: FetchOptions = {},
): Promise<CheckoutResponse> {
  return authorizedFetch<CheckoutResponse>(token, `${API_URL}/carrito/finalizar`, {
    method: 'POST',
    signal: opciones.signal,
    body: JSON.stringify(payload),
  });
}
