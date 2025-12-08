import React, { createContext, useContext, useEffect, useState } from 'react'
import { fetchCarrito, addToCart as apiAddToCart, removeFromCart as apiRemoveFromCart, fetchCarrito as apiFetchCarrito } from '../lib/api'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], subtotal: 0, iva_total: 0, envio: 0, total: 0, loading: true })

  async function loadCart() {
    try {
      const res = await apiFetchCarrito()
      if (res && typeof res.subtotal !== 'undefined') {
        setCart({ ...res, loading: false })
      } else if (res) {
        const computed = computeTotals(res.items || [])
        setCart({ items: res.items || [], ...computed, loading: false })
      } else {
        setCart({ items: [], subtotal: 0, iva_total: 0, envio: 0, total: 0, loading: false })
      }
    } catch (err) {
      console.error('loadCart error', err)
      setCart({ items: [], subtotal: 0, iva_total: 0, envio: 0, total: 0, loading: false })
    }
  }

  useEffect(() => { loadCart() }, [])

  function computeTotals(items = []) {
    let subtotal = 0
    let iva_total = 0
    for (const it of items) {
      const prod = it.producto || it.product || it
      const qty = Number(it.cantidad ?? it.quantity ?? 1)
      const price = Number(prod.precio ?? prod.price ?? 0)
      subtotal += price * qty
      const cat = (prod.categoria || '').toString().toLowerCase()
      const ivaRate = (cat.includes('electron') || cat.includes('electr')) ? 0.10 : 0.21
      iva_total += price * qty * ivaRate
    }
    const envio = subtotal > 1000 ? 0 : (subtotal === 0 ? 0 : 50)
    const total = Math.round((subtotal + iva_total + envio) * 100) / 100
    return { subtotal: Math.round(subtotal * 100) / 100, iva_total: Math.round(iva_total * 100) / 100, envio, total }
  }

  async function addItem(productId, cantidad = 1) {
    try {
      await apiAddToCart(productId, cantidad)
    } catch (err) {
      console.error('addItem error', err)
    }
    await loadCart()
  }

  async function removeItem(productId) {
    try {
      await apiRemoveFromCart(productId)
    } catch (err) {
      console.error('removeItem error', err)
    }
    await loadCart()
  }

  async function changeQuantity(productId, cantidad) {
    // find current quantity in local cart state
    const currentItem = (cart.items || []).find(it => {
      const prod = it.producto || it.product || {}
      const pid = prod.id ?? prod.producto_id ?? prod.producto_id
      return Number(pid) === Number(productId)
    })
    const currentQty = currentItem ? Number(currentItem.cantidad ?? currentItem.quantity ?? 0) : 0

    if (cantidad <= 0) {
      await removeItem(productId)
      return
    }

    const delta = cantidad - currentQty
    if (delta === 0) return

    try {
      if (delta > 0) {
        // need to add only the difference
        await apiAddToCart(productId, delta)
      } else {
        // delta < 0 -> reduce quantity. Backend doesn't offer update, so remove and re-add the desired amount
        await apiRemoveFromCart(productId)
        if (cantidad > 0) {
          await apiAddToCart(productId, cantidad)
        }
      }
    } catch (err) {
      console.error('changeQuantity error', err)
    }

    await loadCart()
  }

  return (
    <CartContext.Provider value={{ cart, loadCart, addItem, removeItem, changeQuantity }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() { return useContext(CartContext) }
