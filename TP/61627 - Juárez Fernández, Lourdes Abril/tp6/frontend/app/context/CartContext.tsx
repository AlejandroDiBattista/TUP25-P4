"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Producto } from '../types'
import { toast } from 'sonner'

interface ItemCarrito {
  producto: Producto
  cantidad: number
}

interface CartContextType {
  items: ItemCarrito[]
  agregarAlCarrito: (producto: Producto) => void
  eliminarDelCarrito: (productoId: number) => void
  actualizarCantidad: (productoId: number, cantidad: number) => void
  vaciarCarrito: () => void
  totalItems: number
  subtotal: number
  iva: number
  envio: number
  total: number
  onProductosChange: (() => void) | null
  setOnProductosChange: (callback: (() => void) | null) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([])
  const [totalesServidor, setTotalesServidor] = useState({ subtotal: 0, iva: 0, envio: 0, total: 0 })
  const [onProductosChange, setOnProductosChange] = useState<(() => void) | null>(null)

  useEffect(() => {
    const token = getToken()
    if (token) {
      fetchBackendCart(token)
    } else {
      const saved = localStorage.getItem('carrito')
      if (saved) {
        try {
          setItems(JSON.parse(saved))
        } catch (e) {
          console.error('Error cargando carrito:', e)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (!getToken()) {
      localStorage.setItem('carrito', JSON.stringify(items))
    }
  }, [items])

  const baseUrl = 'http://127.0.0.1:8000'

  function getToken() {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('token')
  }

  function clearTokenAndFallback() {
    try {
      localStorage.removeItem('token')
    } catch {}
    const saved = typeof window !== 'undefined' ? localStorage.getItem('carrito') : null
    if (saved) {
      try {
        setItems(JSON.parse(saved))
      } catch (e) {
        console.error('Error cargando carrito local:', e)
        setItems([])
      }
    } else {
      setItems([])
    }
    setTotalesServidor({ subtotal: 0, iva: 0, envio: 0, total: 0 })
  }

  async function fetchBackendCart(token: string) {
    try {
      const res = await fetch(`${baseUrl}/carrito`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401) {
        console.warn('Token inválido o expirado; pasando a modo local')
        clearTokenAndFallback()
        return
      }
      if (!res.ok) {
        const detail = await res.json().catch(async () => await res.text().catch(() => ''))
        console.error('No se pudo obtener el carrito:', res.status, detail)
        return
      }
      const data: {
        items?: Array<{ producto: Producto; cantidad: number }>
        subtotal?: number
        iva?: number
        envio?: number
        total?: number
      } = await res.json()
      const serverItems: ItemCarrito[] = (data.items ?? []).map((it) => ({
        producto: it.producto,
        cantidad: it.cantidad,
      }))
      setItems(serverItems)
      setTotalesServidor({
        subtotal: data.subtotal || 0,
        iva: data.iva || 0,
        envio: data.envio || 0,
        total: data.total || 0,
      })
    } catch (e) {
      console.error('Error de red al obtener carrito:', e)
    }
  }

  const agregarAlCarrito = async (producto: Producto) => {
    const token = getToken()
    if (!token) {
      toast.error('Debe iniciar sesión para ver y editar tu carrito')
      return
    }
    
    if (token && producto.id) {
      try {
        const res = await fetch(`${baseUrl}/carrito`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ product_id: producto.id, cantidad: 1 }),
        })
        if (res.status === 401) {
          console.warn('Token inválido al agregar; se borra y se usa modo local')
          clearTokenAndFallback()
        } else if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          const errorMsg = errorData.detail || `Error ${res.status}: No se pudo agregar al carrito`
          console.error('Error del backend:', errorMsg)
          toast.error(errorMsg)
          return
        }
        await fetchBackendCart(token)
        toast.success('Producto agregado al carrito')
        if (onProductosChange) onProductosChange()
        return
      } catch (e) {
        console.error('Error completo al agregar:', e)
        toast.error('Error de conexión al agregar producto')
        return
      }
    }
  }

  const eliminarDelCarrito = async (productoId: number) => {
    const token = getToken()
    if (!token) {
      toast.error('Debe iniciar sesión para ver y editar tu carrito')
      return
    }
    
    if (token) {
      try {
        const res = await fetch(`${baseUrl}/carrito/${productoId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.status === 401) {
          console.warn('Token inválido al eliminar; se borra y se usa modo local')
          clearTokenAndFallback()
        } else if (!res.ok) {
          console.error('No se pudo eliminar del carrito', res.status)
        }
        await fetchBackendCart(token)
        if (onProductosChange) onProductosChange()
        return
      } catch (e) {
        console.error(e)
        toast.error('Error de conexión al eliminar producto')
      }
    }
  }

  const actualizarCantidad = async (productoId: number, cantidad: number) => {
    const token = getToken()
    if (!token) {
      toast.error('Debe iniciar sesión para ver y editar tu carrito')
      return
    }
    
    if (cantidad <= 0) return eliminarDelCarrito(productoId)
    
    if (token) {
      try {
        const res = await fetch(`${baseUrl}/carrito/${productoId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cantidad }),
        })
        if (res.status === 401) {
          console.warn('Token inválido al actualizar; modo local')
          clearTokenAndFallback()
        } else if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          const errorMsg = errorData.detail || `Error ${res.status}: No se pudo actualizar la cantidad`
          toast.error(errorMsg)
          return
        }
        await fetchBackendCart(token)
        if (onProductosChange) onProductosChange()
        return
      } catch (e) {
        console.error(e)
        toast.error('Error de conexión al actualizar cantidad')
      }
    }
  }

  const vaciarCarrito = async () => {
    const token = getToken()
    if (!token) {
      toast.error('Debe iniciar sesión para ver y editar tu carrito')
      return
    }
    
    if (token) {
      try {
        await fetch(`${baseUrl}/carrito/cancelar`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
        await fetchBackendCart(token)
        if (onProductosChange) onProductosChange()
        return
      } catch (e) {
        console.error(e)
        toast.error('Error de conexión al vaciar carrito')
      }
    }
  }

  const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0)

  const hasToken = !!getToken()
  let subtotal = 0, iva = 0, envio = 0, total = 0
  if (hasToken) {
    subtotal = totalesServidor.subtotal
    iva = totalesServidor.iva
    envio = totalesServidor.envio
    total = totalesServidor.total
  } else {
    subtotal = items.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0)
    iva = items.reduce((sum, item) => {
      const isElectronica = (item.producto.categoria || '').toLowerCase().includes('electr')
      const tasa = isElectronica ? 0.10 : 0.21
      return sum + item.producto.precio * item.cantidad * tasa
    }, 0)
      envio = subtotal > 1000 ? 0 : 50
    total = subtotal + iva + envio
  }

  return (
    <CartContext.Provider
      value={{
        items,
        agregarAlCarrito,
        eliminarDelCarrito,
        actualizarCantidad,
        vaciarCarrito,
        totalItems,
        subtotal,
        iva,
        envio,
        total,
        onProductosChange,
        setOnProductosChange,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider')
  }
  return context
}
