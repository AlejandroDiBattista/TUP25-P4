'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProductoCard from './components/ProductoCard';
import {
    cerrarSesion,
    estaAutenticado,
    getAuthHeaders,
    obtenerNombreAlmacenado,
    obtenerUsuarioActual,
} from './services/auth';
import { obtenerProductos } from './services/productos';
import type { Producto } from './types';

interface ItemCarrito {
  producto_id: number;
  nombre: string;
  categoria: string;
  precio: number;
  cantidad: number;
  subtotal: number;
  stock_disponible: number;
  imagen: string;
}

interface CarritoResponse {
  items: ItemCarrito[];
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
}

export default function Home() {
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [autenticado, setAutenticado] = useState(false);
  const [carrito, setCarrito] = useState<CarritoResponse | null>(null);
  const [cargandoCarrito, setCargandoCarrito] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [itemEnProceso, setItemEnProceso] = useState<number | null>(null);
  const [todosProductos, setTodosProductos] = useState<Producto[]>([]);
  const [categoriasDisponibles, setCategoriasDisponibles] = useState<string[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('todas');
  const [nombreUsuario, setNombreUsuario] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const mostrarMensaje = (texto: string) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(''), 2500);
  };

  useEffect(() => {
    const autenticadoActual = estaAutenticado();
    setAutenticado(autenticadoActual);

    const cargarProductos = async () => {
      try {
        const data = await obtenerProductos();
        setTodosProductos(data);
        setProductos(data);
        const categoriasUnicas = Array.from(new Set(data.map((producto) => producto.categoria))).sort((a, b) => a.localeCompare(b));
        setCategoriasDisponibles(categoriasUnicas);
      } catch (error) {
        console.error('Error al cargar productos:', error);
      } finally {
        setLoading(false);
      }
    };

    void cargarProductos();
  }, []);

  useEffect(() => {
    const texto = busqueda.trim().toLowerCase();
    const categoriaNormalizada = categoriaSeleccionada.toLowerCase();

    const filtrados = todosProductos.filter((producto) => {
      const nombreProducto = (producto.titulo ?? producto.nombre ?? '').toLowerCase();
      const descripcionProducto = (producto.descripcion ?? '').toLowerCase();
      const categoriaProducto = (producto.categoria ?? '').toLowerCase();

      const coincideBusqueda =
        texto === '' ||
        nombreProducto.includes(texto) ||
        descripcionProducto.includes(texto) ||
        categoriaProducto.includes(texto);

      const coincideCategoria =
        categoriaSeleccionada === 'todas' || categoriaProducto === categoriaNormalizada;

      return coincideBusqueda && coincideCategoria;
    });

    setProductos(filtrados);
  }, [busqueda, categoriaSeleccionada, todosProductos]);

  useEffect(() => {
    if (estaAutenticado()) {
      void cargarCarrito();
    } else {
      setCarrito(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autenticado]);

  useEffect(() => {
    if (!autenticado) {
      setNombreUsuario('');
      return;
    }

    const almacenado = obtenerNombreAlmacenado();
    if (almacenado) {
      setNombreUsuario(almacenado);
      return;
    }

    obtenerUsuarioActual()
      .then((usuario) => setNombreUsuario(usuario.nombre))
      .catch((err) => console.error('Error al obtener usuario actual:', err));
  }, [autenticado]);

  const cargarCarrito = async () => {
    if (!estaAutenticado()) {
      setCarrito(null);
      return;
    }

    setCargandoCarrito(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/carrito`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('No se pudo obtener el carrito');
      }

      const data: CarritoResponse = await response.json();
      setCarrito(data);
    } catch (err) {
      console.error('Error al cargar carrito:', err);
      setCarrito(null);
      setError(err instanceof Error ? err.message : 'Error al cargar el carrito');
    } finally {
      setCargandoCarrito(false);
    }
  };

  const handleLogout = async () => {
    try {
      await cerrarSesion();
      setAutenticado(false);
      setCarrito(null);
      router.refresh();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const actualizarCantidad = async (productoId: number, nuevaCantidad: number) => {
    if (!autenticado) return;

    if (nuevaCantidad < 1) {
      await eliminarItem(productoId);
      return;
    }

    try {
      setItemEnProceso(productoId);
      const response = await fetch(`${API_URL}/carrito/${productoId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ cantidad: nuevaCantidad }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || 'No se pudo actualizar la cantidad');
      }

      await cargarCarrito();
      mostrarMensaje('Cantidad actualizada');
    } catch (err) {
      console.error('Error al actualizar cantidad:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar la cantidad');
    } finally {
      setItemEnProceso(null);
    }
  };

  const eliminarItem = async (productoId: number) => {
    if (!autenticado) return;

    try {
      setItemEnProceso(productoId);
      const response = await fetch(`${API_URL}/carrito/quitar/${productoId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('No se pudo eliminar el producto');
      }

      await cargarCarrito();
      mostrarMensaje('Producto eliminado del carrito');
    } catch (err) {
      console.error('Error al eliminar item:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar el producto');
    } finally {
      setItemEnProceso(null);
    }
  };

  const vaciarCarrito = async () => {
    if (!autenticado || !carrito || carrito.items.length === 0) {
      return;
    }

    if (!window.confirm('¿Vaciar todo el carrito?')) return;

    try {
      const response = await fetch(`${API_URL}/carrito/cancelar`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('No se pudo vaciar el carrito');
      }

      await cargarCarrito();
      mostrarMensaje('Carrito vaciado');
    } catch (err) {
      console.error('Error al vaciar carrito:', err);
      setError(err instanceof Error ? err.message : 'Error al vaciar el carrito');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Catálogo de Productos
              </h1>
              <p className="text-gray-600 mt-2">
                {productos.length} productos disponibles
              </p>
            </div>
            <div className="flex items-center gap-6">
              {autenticado && (
                <span className="nav-username">
                  {nombreUsuario ? `Hola, ${nombreUsuario}` : 'Hola'}
                </span>
              )}
              {autenticado ? (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.push('/compras')}
                    className="btn-link font-semibold"
                  >
                    Historial de compras
                  </button>
                  <button
                    onClick={handleLogout}
                    className="btn-link"
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => router.push('/auth')}
                  className="btn-primary"
                >
                  Iniciar sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {mensaje && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
            {mensaje}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <section className="mb-6">
          <div className="card-surface p-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex-1 w-full">
              <label htmlFor="buscar-productos" className="block text-sm font-medium text-gray-700 mb-1">
                Buscar productos
              </label>
              <input
                id="buscar-productos"
                type="search"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Buscar por nombre, descripción o categoría"
                className="input-field"
              />
            </div>
            <div className="w-full md:w-64">
              <label htmlFor="categoria-productos" className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                id="categoria-productos"
                value={categoriaSeleccionada}
                onChange={(event) => setCategoriaSeleccionada(event.target.value)}
                className="input-field"
              >
                <option value="todas">Todas las categorías</option>
                {categoriasDisponibles.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {productos.length === 0 ? (
                <div className="col-span-full text-center text-gray-600 py-12">
                  No encontramos productos que coincidan con tu búsqueda.
                </div>
              ) : (
                productos.map((producto) => (
                  <ProductoCard
                    key={producto.id}
                    producto={producto}
                    autenticado={autenticado}
                    cantidadEnCarrito={carrito?.items.find((item) => item.producto_id === producto.id)?.cantidad ?? 0}
                    onAgregado={() => {
                      mostrarMensaje('Producto agregado al carrito');
                      void cargarCarrito();
                    }}
                  />
                ))
              )}
            </div>
          </section>

          <aside className="lg:col-span-1">
            <div className="card-surface p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4">Tu carrito</h2>

              {!autenticado ? (
                <div className="text-center text-gray-600">
                  <p className="mb-4">Inicia sesión para agregar productos y ver tu carrito.</p>
                  <button
                    onClick={() => router.push('/auth')}
                    className="btn-primary w-full justify-center"
                  >
                    Iniciar sesión
                  </button>
                </div>
              ) : cargandoCarrito ? (
                <p className="text-gray-600">Cargando carrito...</p>
              ) : !carrito || carrito.items.length === 0 ? (
                <div className="text-center text-gray-600">
                  <p className="mb-4">Tu carrito está vacío.</p>
                  <p className="text-sm">Agrega productos del catálogo para verlos aquí.</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-500">{carrito.items.length} producto{carrito.items.length !== 1 ? 's' : ''}</span>
                    <button
                      onClick={vaciarCarrito}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Vaciar
                    </button>
                  </div>

                  <div className="space-y-3 mb-6 max-h-80 overflow-y-auto pr-2">
                    {carrito.items.map((item) => {
                      const puedeIncrementar = item.cantidad < item.stock_disponible;
                      const puedeDecrementar = item.cantidad > 1;

                      return (
                        <div key={item.producto_id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">{item.nombre}</p>
                              <p className="text-xs text-gray-500">{item.categoria}</p>
                              <p className="text-sm text-gray-600 mt-1">${item.precio.toFixed(2)} c/u</p>
                            </div>
                            <button
                              onClick={() => void eliminarItem(item.producto_id)}
                              disabled={itemEnProceso === item.producto_id}
                              className="text-red-500 hover:text-red-600 text-sm"
                            >
                              Quitar
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => void actualizarCantidad(item.producto_id, item.cantidad - 1)}
                                disabled={!puedeDecrementar || itemEnProceso === item.producto_id}
                                className="w-8 h-8 flex items-center justify-center border rounded-full text-lg text-gray-700 disabled:text-gray-300 disabled:border-gray-200"
                                aria-label={`Disminuir cantidad de ${item.nombre}`}
                              >
                                −
                              </button>
                              <span className="w-10 text-center font-medium">{item.cantidad}</span>
                              <button
                                onClick={() => void actualizarCantidad(item.producto_id, item.cantidad + 1)}
                                disabled={!puedeIncrementar || itemEnProceso === item.producto_id}
                                className="w-8 h-8 flex items-center justify-center border rounded-full text-lg text-gray-700 disabled:text-gray-300 disabled:border-gray-200"
                                aria-label={`Aumentar cantidad de ${item.nombre}`}
                              >
                                +
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Subtotal</p>
                              <p className="text-base font-semibold text-gray-900">${item.subtotal.toFixed(2)}</p>
                              {!puedeIncrementar && (
                                <p className="text-xs text-orange-600 mt-1">Stock máximo alcanzado</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-2 text-gray-700 text-sm">
                    <div className="flex justify-between"><span>Subtotal</span><span>${carrito.subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>IVA</span><span>${carrito.iva.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Envío</span><span>{carrito.envio === 0 ? 'GRATIS' : `$${carrito.envio.toFixed(2)}`}</span></div>
                  </div>

                  <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-blue-600">${carrito.total.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={() => router.push('/carrito')}
                    className="btn-primary w-full mt-4"
                  >
                    Finalizar compra
                  </button>
                </>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
