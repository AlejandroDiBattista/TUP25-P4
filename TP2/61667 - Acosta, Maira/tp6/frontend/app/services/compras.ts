// app/services/compras.ts
import type { Compra } from '../types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function authHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const token = window.localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function obtenerCompras(): Promise<Compra[]> {
  const res = await fetch(`${API_URL}/compras`, { headers: { 'Content-Type': 'application/json', ...authHeader() } })
  if (!res.ok) throw new Error(`Error fetching compras: ${res.status}`)
  return await res.json()
}

export async function obtenerCompraPorId(id: number): Promise<Compra> {
  const res = await fetch(`${API_URL}/compras/${id}`, { headers: { 'Content-Type': 'application/json', ...authHeader() } })
  if (!res.ok) throw new Error(`Error fetching compra ${id}: ${res.status}`)
  return await res.json()
}

export default { obtenerCompras, obtenerCompraPorId }
