import { Producto } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function obtenerProductos(filtro?: {categoria?: string, buscar?: string}): Promise<Producto[]> {

  let url = `${API_URL}/productos`

  if (filtro && (filtro.categoria || filtro.buscar)) {
    const params =  new URLSearchParams()
    if (filtro.categoria)
      params.append("categoria", filtro.categoria)
    if (filtro.buscar)
      params.append("buscar", filtro.buscar)

    url += `?${params.toString()}`
  }

  try {
  const response = await fetch(url, {
    cache: 'no-store'
  })
  if (!response.ok) throw new Error('Error al obtener productos')
  return await response.json()
  } catch (error) {
    console.error("Falló la conexión", error)
    return []
  }
}
