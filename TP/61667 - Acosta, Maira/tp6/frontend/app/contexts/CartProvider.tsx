"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useAuth } from "./AuthProvider"

type ProductoCarrito = {
  id: number
  nombre: string
  precio: number
  cantidad: number
  imagen: string
}

type CartContextType = {
  productos: ProductoCarrito[]
  agregarProducto: (producto: { id: number; nombre: string; precio: number; imagen: string }) => Promise<boolean>
  removerProducto: (id: number) => void
  actualizarCantidad: (id: number, cantidad: number) => void
  limpiarCarrito: () => void
  finalizarCompra: () => Promise<boolean>
  cancelarCompra: () => Promise<boolean>
  subtotal: number
  iva: number
  envio: number
  total: number
  cantidadTotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { usuario, token } = useAuth()
  const [productos, setProductos] = useState<ProductoCarrito[]>([])

  // Cargar carrito del localStorage cuando el usuario cambia
  useEffect(() => {
    if (usuario) {
      const savedCart = localStorage.getItem(`carrito_${usuario.email}`)
      if (savedCart) {
        try {
          setProductos(JSON.parse(savedCart))
        } catch (error) {
          console.error("Error cargando carrito:", error)
          setProductos([])
        }
      }
    } else {
      setProductos([])
    }
  }, [usuario])

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (usuario) {
      localStorage.setItem(`carrito_${usuario.email}`, JSON.stringify(productos))
    }
  }, [productos, usuario])

  const agregarProducto = async (producto: { id: number; nombre: string; precio: number; imagen: string }): Promise<boolean> => {
    if (!token || !usuario) {
      return false
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/agregar-carrito", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Bearer ${token}`,
        },
        body: new URLSearchParams({
          producto_id: producto.id.toString(),
          cantidad: "1"
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Actualizar carrito local
        setProductos(prev => {
          const existingProduct = prev.find(p => p.id === producto.id)
          if (existingProduct) {
            return prev.map(p => 
              p.id === producto.id 
                ? { ...p, cantidad: p.cantidad + 1 }
                : p
            )
          } else {
            return [...prev, { ...producto, cantidad: 1 }]
          }
        })

        // Disparar evento para actualizar stock en tiempo real
        window.dispatchEvent(new CustomEvent('stockUpdated', { 
          detail: { productoId: producto.id, nuevoStock: data.stock_restante } 
        }))

        return true
      } else {
        console.error("Error del servidor:", data)
        return false
      }
    } catch (error) {
      console.error("Error de conexión:", error)
      return false
    }
  }

  const removerProducto = async (id: number) => {
    const producto = productos.find(p => p.id === id)
    if (!producto || !token) return

    try {
      const response = await fetch("http://127.0.0.1:8000/remover-producto-carrito", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Bearer ${token}`,
        },
        body: new URLSearchParams({
          producto_id: id.toString(),
          cantidad: producto.cantidad.toString()
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Remover del carrito local
        setProductos(prev => prev.filter(p => p.id !== id))

        // Actualizar stock en tiempo real
        window.dispatchEvent(new CustomEvent('stockUpdated', { 
          detail: { productoId: id, nuevoStock: data.stock_restante } 
        }))
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const actualizarCantidad = async (id: number, nuevaCantidad: number) => {
    const productoEnCarrito = productos.find(p => p.id === id)
    if (!productoEnCarrito || !token) return

    const cantidadActual = productoEnCarrito.cantidad

    if (nuevaCantidad <= 0) {
      await removerProducto(id)
      return
    }

    try {
      let response
      let data

      if (nuevaCantidad > cantidadActual) {
        // Aumentar cantidad (reducir stock)
        response = await fetch("http://127.0.0.1:8000/aumentar-cantidad-carrito", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Bearer ${token}`,
          },
          body: new URLSearchParams({
            producto_id: id.toString()
          })
        })
      } else {
        // Disminuir cantidad (aumentar stock)
        response = await fetch("http://127.0.0.1:8000/disminuir-cantidad-carrito", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Bearer ${token}`,
          },
          body: new URLSearchParams({
            producto_id: id.toString()
          })
        })
      }

      data = await response.json()

      if (response.ok) {
        // Actualizar carrito local
        setProductos(prev => 
          prev.map(p => 
            p.id === id 
              ? { ...p, cantidad: nuevaCantidad }
              : p
          )
        )

        // Actualizar stock en tiempo real
        window.dispatchEvent(new CustomEvent('stockUpdated', { 
          detail: { productoId: id, nuevoStock: data.stock_restante } 
        }))
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const limpiarCarrito = () => {
    setProductos([])
  }

  const finalizarCompra = async (): Promise<boolean> => {
    if (!token || productos.length === 0) return false

    try {
      const response = await fetch("http://127.0.0.1:8000/finalizar-compra", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      })

      if (response.ok) {
        setProductos([])
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error("Error:", error)
      return false
    }
  }

  const cancelarCompra = async (): Promise<boolean> => {
    if (!token || productos.length === 0) return false

    try {
      const carritoData = productos.map(p => ({ id: p.id, cantidad: p.cantidad }))
      
      const response = await fetch("http://127.0.0.1:8000/cancelar-compra", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(carritoData)
      })

      if (response.ok) {
        // Disparar evento para restaurar stock
        productos.forEach(p => {
          window.dispatchEvent(new CustomEvent('stockRestored', { 
            detail: { productoId: p.id, cantidadRestaurada: p.cantidad } 
          }))
        })

        setProductos([])
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error("Error:", error)
      return false
    }
  }

  // Cálculos
  const subtotal = productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0)
  
  // IVA diferenciado: 21% general, 10% electrónicos
  // NOTA: Este cálculo es aproximado para la UI, el cálculo final se hace en el backend
  const iva = productos.reduce((sum, p) => {
    // Verificar si es electrónico (esto es una simplificación para la UI)
    const esElectronico = p.nombre.toLowerCase().includes('electr') || 
                         p.nombre.toLowerCase().includes('compu') ||
                         p.nombre.toLowerCase().includes('celular') ||
                         p.nombre.toLowerCase().includes('tablet')
    const tasaIva = esElectronico ? 0.10 : 0.21
    return sum + (p.precio * p.cantidad * tasaIva)
  }, 0)
  
  // Envío gratuito para compras >= $1000
  const envio = subtotal >= 1000 ? 0 : 50
  const total = subtotal + iva + envio
  const cantidadTotal = productos.reduce((sum, p) => sum + p.cantidad, 0)

  return (
    <CartContext.Provider value={{
      productos,
      agregarProducto,
      removerProducto,
      actualizarCantidad,
      limpiarCarrito,
      finalizarCompra,
      cancelarCompra,
      subtotal,
      iva,
      envio,
      total,
      cantidadTotal
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart debe ser usado dentro de CartProvider")
  }
  return context
}
