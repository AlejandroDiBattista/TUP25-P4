// app/services/carrito.ts
import type { Producto } from '../types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function authHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const token = window.localStorage.getItem('token')
  try { console.log('[DEBUG] authHeader: token preview=', token ? token.slice(0,16) : null) } catch (e) {}
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function obtenerCarrito(): Promise<{ items: Array<{ producto: Producto; cantidad: number }>; subtotal: number }>{
  const res = await fetch(`${API_URL}/carrito`, { headers: { 'Content-Type': 'application/json', ...authHeader() } })
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('token')
      window.location.href = '/login'
    }
    throw new Error('Unauthorized')
  }
  if (!res.ok) throw new Error(`Error obteniendo carrito: ${res.status}`)
  return await res.json()
}

export async function agregarAlCarrito(productId: number, cantidad = 1) {
  const tokenPreview = (typeof window !== 'undefined') ? window.localStorage.getItem('token')?.slice(0,16) : undefined
  try { console.log('[DEBUG] agregarAlCarrito: token preview=', tokenPreview) } catch (e) {}

  const res = await fetch(`${API_URL}/carrito`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ product_id: productId, cantidad }),
  })
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('token')
      window.location.href = '/login'
    }
    throw new Error('Unauthorized')
  }
  if (!res.ok) {
    let body = ''
    try { body = JSON.stringify(await res.json()) } catch (_) { body = await res.text().catch(() => '') }
    throw new Error(`Error agregando al carrito: ${res.status} ${body}`)
  }
  return await res.json()
}

export async function quitarProducto(productId: number) {
  const res = await fetch(`${API_URL}/carrito/${productId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
  })
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('token')
      window.location.href = '/login'
    }
    throw new Error('Unauthorized')
  }
  if (!res.ok) {
    let body = ''
    try { body = JSON.stringify(await res.json()) } catch (_) { body = await res.text().catch(() => '') }
    throw new Error(`Error quitando producto: ${res.status} ${body}`)
  }
  return await res.json()
}

export async function finalizarCompra(payload: { direccion: string; tarjeta: string }) {
  const res = await fetch(`${API_URL}/carrito/finalizar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(payload),
  })
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('token')
      window.location.href = '/login'
    }
    throw new Error('Unauthorized')
  }
  if (!res.ok) {
    let body = ''
    try { body = JSON.stringify(await res.json()) } catch (_) { body = await res.text().catch(() => '') }
    throw new Error(`Error finalizando compra: ${res.status} ${body}`)
  }
  return await res.json()
}

export async function cancelarCarrito() {
  const res = await fetch(`${API_URL}/carrito/cancelar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
  })
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('token')
      window.location.href = '/login'
    }
    throw new Error('Unauthorized')
  }
  if (!res.ok) {
    let body = ''
    try { body = JSON.stringify(await res.json()) } catch (_) { body = await res.text().catch(() => '') }
    throw new Error(`Error cancelando carrito: ${res.status} ${body}`)
  }
  return await res.json()
}

export default { obtenerCarrito, agregarAlCarrito, quitarProducto, finalizarCompra, cancelarCarrito }
