"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./contexts/AuthProvider"
import { useCart } from "./contexts/CartProvider"
import { useRouter } from "next/navigation"
import Link from "next/link"

type Producto = {
  id: number
  nombre: string
  precio: number
  descripcion: string
  categoria: string
  existencia: number
  imagen: string
}

export default function Home() {
  const { usuario, logout, isLoading } = useAuth()
  const router = useRouter()
  const { 
    productos: productosCarrito, 
    agregarProducto, 
    removerProducto, 
    actualizarCantidad, 
    finalizarCompra,
    cancelarCompra,
    subtotal, 
    iva, 
    envio, 
    total,
    cantidadTotal 
  } = useCart()
  const [productos, setProductos] = useState<Producto[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [categoria, setCategoria] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("http://127.0.0.1:8000/productos")
      .then(res => res.json())
      .then(data => {
        setProductos(data)
        setLoading(false)
      })
      .catch(error => {
        console.error("Error:", error)
        setLoading(false)
      })
  }, [])

  // Escuchar eventos de actualización de stock
  useEffect(() => {
    const handleStockUpdate = (event: any) => {
      const { productoId, nuevoStock } = event.detail
      setProductos(prev => 
        prev.map(p => 
          p.id === productoId 
            ? { ...p, existencia: nuevoStock }
            : p
        )
      )
    }

    const handleStockRestore = (event: any) => {
      const { productoId, cantidadRestaurada } = event.detail
      setProductos(prev => 
        prev.map(p => 
          p.id === productoId 
            ? { ...p, existencia: p.existencia + cantidadRestaurada }
            : p
        )
      )
    }

    window.addEventListener('stockUpdated', handleStockUpdate)
    window.addEventListener('stockRestored', handleStockRestore)

    return () => {
      window.removeEventListener('stockUpdated', handleStockUpdate)
      window.removeEventListener('stockRestored', handleStockRestore)
    }
  }, [])

  const productosFiltrados = productos.filter(
    (p) =>
      ((p.nombre || "")
        .toLowerCase()
        .includes(busqueda.toLowerCase()) ||
        (p.descripcion || "")
          .toLowerCase()
          .includes(busqueda.toLowerCase())) &&
      (categoria === "" || p.categoria === categoria)
  )

  const categorias = Array.from(
    new Set(productos.map((p) => p.categoria).filter(Boolean))
  )

  const handleAgregarAlCarrito = async (producto: Producto) => {
    const success = await agregarProducto({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen
    })
    
    if (success) {
      console.log("Producto agregado al carrito")
    }
  }

  const handleContinuarCompra = () => {
    router.push("/checkout")
  }

  const handleCancelarCompra = async () => {
    await cancelarCompra()
  }

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">TP6 Shop</h1>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-900">TP6 Shop</h1>
          <nav className="flex gap-4 text-sm">
            <span className="text-gray-600">Productos</span>
            {usuario ? (
              <>
                <Link href="/mis-compras" className="text-gray-600">Mis compras</Link>
                <span className="text-gray-600">{usuario.nombre}</span>
                <button onClick={logout} className="text-gray-600 hover:text-gray-900">Salir</button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-blue-600 hover:text-blue-800">Ingresar</Link>
                <Link href="/register" className="text-blue-600 hover:text-blue-800">Crear cuenta</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Filtros */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full border border-gray-300 rounded px-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Layout principal con productos y sidebar */}
        <div className="flex gap-6">
          {/* Lista de productos */}
          <div className="flex-1 space-y-3">
            {productosFiltrados.map((producto) => (
              <div key={producto.id} className="bg-white border border-gray-200 rounded p-4">
                <div className="flex items-start gap-4">
                  {/* Imagen */}
                  <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                    <img 
                      src={`http://127.0.0.1:8000${producto.imagen}`}
                      alt={producto.nombre}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23f3f4f6'/%3E%3Ctext x='32' y='32' text-anchor='middle' dy='0.3em' font-family='Arial' font-size='9' fill='%239ca3af'%3ESin imagen%3C/text%3E%3C/svg%3E"
                      }}
                    />
                  </div>

                  {/* Información del producto */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-base mb-1">
                      {producto.nombre}
                    </h3>
                    <p className="text-gray-600 text-sm mb-1 line-clamp-2">
                      {producto.descripcion}
                    </p>
                    <p className="text-xs text-gray-500">
                      Categoría: {producto.categoria}
                    </p>
                  </div>

                  {/* Precio y botón */}
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900 mb-1">
                      ${producto.precio}
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      Disponible: {producto.existencia}
                    </div>
                    
                    {producto.existencia > 0 ? (
                      <button 
                        onClick={() => handleAgregarAlCarrito(producto)}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          usuario 
                            ? "bg-gray-800 text-white hover:bg-gray-700" 
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                        disabled={!usuario}
                      >
                        Agregar al carrito
                      </button>
                    ) : (
                      <span className="inline-block bg-red-100 text-red-600 px-3 py-1 rounded text-xs">
                        Agotado
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {productosFiltrados.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No se encontraron productos
              </div>
            )}
          </div>

          {/* Sidebar derecho - Carrito */}
          <div className="w-80">
            {!usuario ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-600 text-center text-sm">
                  Inicie sesión para ver y editar su carrito.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4">Mi Carrito</h3>
                
                {productosCarrito.length === 0 ? (
                  <p className="text-gray-500 text-sm">Tu carrito está vacío</p>
                ) : (
                  <>
                    {/* Productos en el carrito */}
                    <div className="space-y-3 mb-4">
                      {productosCarrito.map((producto) => (
                        <div key={producto.id} className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            <img 
                              src={`http://127.0.0.1:8000${producto.imagen}`}
                              alt={producto.nombre}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {producto.nombre}
                            </h4>
                            <p className="text-xs text-gray-500">
                              ${producto.precio.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => actualizarCantidad(producto.id, producto.cantidad - 1)}
                              className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-sm hover:bg-gray-50"
                            >
                              -
                            </button>
                            <span className="text-sm font-medium w-8 text-center">
                              {producto.cantidad}
                            </span>
                            <button
                              onClick={() => actualizarCantidad(producto.id, producto.cantidad + 1)}
                              className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-sm hover:bg-gray-50"
                            >
                              +
                            </button>
                            <button
                              onClick={() => removerProducto(producto.id)}
                              className="w-6 h-6 rounded text-red-600 hover:bg-red-50 flex items-center justify-center text-sm"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Resumen */}
                    <div className="border-t border-gray-200 pt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>IVA</span>
                        <span>${iva.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Envío</span>
                        <span>${envio.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-base border-t border-gray-200 pt-2">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Botones */}
                    <div className="mt-4 space-y-2">
                      <button
                        onClick={handleContinuarCompra}
                        className="w-full bg-gray-800 text-white py-2 px-4 rounded text-sm font-medium hover:bg-gray-700"
                      >
                        Continuar compra
                      </button>
                      <button
                        onClick={handleCancelarCompra}
                        className="w-full text-gray-600 py-1 text-sm hover:text-gray-900"
                      >
                        × Cancelar
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
