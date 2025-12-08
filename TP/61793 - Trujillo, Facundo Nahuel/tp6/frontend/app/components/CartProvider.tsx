"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { obtenerCarrito, agregarAlCarrito, quitarProducto, cancelarCarrito } from '../services/carrito'
import type { Producto } from '../types'

type CartItem = { producto: Producto; cantidad: number }

type CartContextType = {
  items: CartItem[]
  subtotal: number
  reserved: Record<number, number>
  load: () => Promise<void>
  add: (producto: Producto, cantidad?: number) => Promise<void>
  remove: (productId: number) => Promise<void>
  clear: () => Promise<void>
}

const CartContext = createContext<CartContextType>({
  items: [], subtotal: 0, reserved: {}, load: async () => {}, add: async () => {}, remove: async () => {}, clear: async () => {},
})

export function useCart() { return useContext(CartContext) }

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const [reserved, setReserved] = useState<Record<number, number>>({})

  async function load() {
    try {
      const data = await obtenerCarrito()
      setItems(data.items || [])
      setSubtotal(data.subtotal || 0)
      const r: Record<number, number> = {}
      ;(data.items || []).forEach((it: CartItem) => { r[it.producto.id] = it.cantidad })
      setReserved(r)
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => {
    // try load once on mount if token present
    if (typeof window === 'undefined') return
    const t = window.localStorage.getItem('token')
    if (!t) return
    load()
  }, [])

  async function add(producto: Producto, cantidad = 1) {
    // optimistic update
    setReserved(prev => ({ ...prev, [producto.id]: (prev[producto.id] || 0) + cantidad }))
    setItems(prev => {
      const found = prev.find(p => p.producto.id === producto.id)
      if (found) return prev.map(p => p.producto.id === producto.id ? { ...p, cantidad: p.cantidad + cantidad } : p)
      return [...prev, { producto, cantidad }]
    })
    setSubtotal(prev => Number((prev + producto.precio * cantidad).toFixed(2)))
    try {
      await agregarAlCarrito(producto.id, cantidad)
    } catch (e) {
      // revert optimistic
      setReserved(prev => ({ ...prev, [producto.id]: Math.max(0, (prev[producto.id] || 0) - cantidad) }))
      setItems(prev => {
        const found = prev.find(p => p.producto.id === producto.id)
        if (!found) return prev
        if (found.cantidad - cantidad <= 0) return prev.filter(p => p.producto.id !== producto.id)
        return prev.map(p => p.producto.id === producto.id ? { ...p, cantidad: p.cantidad - cantidad } : p)
      })
      setSubtotal(prev => Number((prev - producto.precio * cantidad).toFixed(2)))
      throw e
    }
  }

  async function remove(productId: number) {
    // optimistic remove one unit
    const prod = items.find(i => i.producto.id === productId)
    if (prod) {
      setReserved(prev => ({ ...prev, [productId]: Math.max(0, (prev[productId] || 0) - 1) }))
      setItems(prev => prev.map(p => p.producto.id === productId ? { ...p, cantidad: Math.max(0, p.cantidad - 1) } : p).filter(p => p.cantidad > 0))
      setSubtotal(prev => Number((prev - prod.producto.precio).toFixed(2)))
    }
    try {
      await quitarProducto(productId)
      await load()
    } catch (e) {
      // on error, reload to be safe
      await load()
      throw e
    }
  }

  async function clear() {
    try {
      await cancelarCarrito()
      setItems([])
      setReserved({})
      setSubtotal(0)
    } catch (e) {
      throw e
    }
  }

  return (
    <CartContext.Provider value={{ items, subtotal, reserved, load, add, remove, clear }}>
      {children}
    </CartContext.Provider>
  )
}
