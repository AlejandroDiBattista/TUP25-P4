// app/services/productos.ts
import type { Producto } from '../types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function obtenerProductos(q?: string, categoria?: string): Promise<Producto[]> {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (categoria) params.set('categoria', categoria)
  const url = `${API_URL}/productos${params.toString() ? '?' + params.toString() : ''}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Error fetching productos: ${res.status}`)
  const data = await res.json()
  // data is expected to be an array of products matching backend shape
  return data as Producto[]
}

export async function obtenerProductoPorId(id: number): Promise<Producto> {
  const url = `${API_URL}/productos/${id}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Error fetching producto ${id}: ${res.status}`)
  return (await res.json()) as Producto
}