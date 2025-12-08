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

  const [todosProductos, setTodosProductos] = useState<Producto[]>([]);
  const [categoriasDisponibles, setCategoriasDisponibles] = useState<string[]>([]);

  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('todas');
  const [nombreUsuario, setNombreUsuario] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // -------------------------------------------------------
  // 🔥 QUITAR PRODUCTO
  // -------------------------------------------------------
  const quitarProducto = async (productoId: number) => {
    try {
      const res = await fetch(`${API_URL}/carrito/quitar/${productoId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      if (!res.ok) throw new Error('Error al quitar el producto');
      cargarCarrito();

    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------------------------------------
  // 🔥 VACIAR CARRITO
  // -------------------------------------------------------
  const vaciarCarrito = async () => {
    try {
      const res = await fetch(`${API_URL}/carrito/cancelar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      if (!res.ok) throw new Error('Error al vaciar el carrito');
      cargarCarrito();

    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------------------------------------
  // 🔥 SUMAR / RESTAR CANTIDAD
  // -------------------------------------------------------
  const incrementarCantidad = async (productoId: number, cantidadActual: number) => {
    try {
      const res = await fetch(`${API_URL}/carrito/${productoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ cantidad: cantidadActual + 1 }),
      });

      if (!res.ok) throw new Error("Error incrementando cantidad");
      cargarCarrito();

    } catch (err) {
      console.error(err);
    }
  };

  const disminuirCantidad = async (productoId: number, cantidadActual: number) => {
    try {
      const nueva = cantidadActual - 1;

      const res = await fetch(`${API_URL}/carrito/${productoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ cantidad: nueva }),
      });

      if (!res.ok) throw new Error("Error disminuyendo cantidad");
      cargarCarrito();

    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------------------------------------
  // 🔥 CARGAR CARRITO
  // -------------------------------------------------------
  const cargarCarrito = async () => {
    if (!estaAutenticado()) return;

    setCargandoCarrito(true);

    try {
      const response = await fetch(`${API_URL}/carrito`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('No se pudo obtener el carrito');

      const data: CarritoResponse = await response.json();
      setCarrito(data);

    } catch (err) {
      console.error(err);
      setCarrito(null);
    } finally {
      setCargandoCarrito(false);
    }
  };

  // -------------------------------------------------------
  // 🔥 CARGA INICIAL DE PRODUCTOS
  // -------------------------------------------------------
  useEffect(() => {
    const autenticadoActual = estaAutenticado();
    setAutenticado(autenticadoActual);

    const cargarProductosAsync = async () => {
      try {
        const data = await obtenerProductos();
        setTodosProductos(data);
        setProductos(data);

        const categoriasUnicas = Array.from(new Set(data.map((p) => p.categoria))).sort();
        setCategoriasDisponibles(categoriasUnicas);

      } catch (err) {
        console.error('Error al cargar productos:', err);
      } finally {
        setLoading(false);
      }
    };

    void cargarProductosAsync();
  }, []);

  // -------------------------------------------------------
  // 🔥 FILTRADO COMPLETO
  // -------------------------------------------------------
  useEffect(() => {
    if (todosProductos.length === 0) return;

    const texto = busqueda.trim().toLowerCase();
    const categoriaFiltro = categoriaSeleccionada.toLowerCase();

    const filtrados = todosProductos.filter((prod) => {
      const nombre = (prod.nombre ?? prod.titulo ?? "").toLowerCase();
      const descripcion = (prod.descripcion ?? "").toLowerCase();
      const categoria = (prod.categoria ?? "").toLowerCase();

      const coincideTexto =
        texto === "" ||
        nombre.includes(texto) ||
        descripcion.includes(texto) ||
        categoria.includes(texto);

      const coincideCategoria =
        categoriaSeleccionada === "todas" ||
        categoria === categoriaFiltro;

      return coincideTexto && coincideCategoria;
    });

    setProductos(filtrados);
  }, [busqueda, categoriaSeleccionada, todosProductos]);

  // -------------------------------------------------------
  // 🔥 CARGAR CARRITO SI ESTÁ LOGUEADO
  // -------------------------------------------------------
  useEffect(() => {
    if (estaAutenticado()) cargarCarrito();
  }, [autenticado]);

  // -------------------------------------------------------
  // 🔥 NOMBRE DEL USUARIO
  // -------------------------------------------------------
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
      .then((u) => setNombreUsuario(u.nombre))
      .catch(console.error);

  }, [autenticado]);

  const handleLogout = async () => {
    try {
      await cerrarSesion();
      setAutenticado(false);
      setCarrito(null);
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando productos...</p>
      </div>
    );
  }

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="min-h-screen bg-gray-50">

      {/* NAVBAR */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-5 flex justify-between items-center">

          <h1 className="text-2xl font-bold">Catálogo de Productos</h1>

          <div className="flex items-center gap-6">

            <button
              onClick={() => router.push('/')}
              className="text-gray-700 hover:underline"
            >
              Inicio
            </button>

            {autenticado && (
              <span className="text-gray-700 font-semibold">
                Hola, {nombreUsuario}
              </span>
            )}

            {autenticado ? (
              <>
                <button
                  onClick={() => router.push('/compras')}
                  className="text-blue-600 hover:underline"
                >
                  Historial de compras
                </button>

                <button
                  onClick={handleLogout}
                  className="text-red-500 hover:underline"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push('/auth')}
                className="bg-blue-600 px-4 py-2 text-white rounded-lg shadow hover:bg-blue-700"
              >
                Iniciar Sesión
              </button>
            )}

          </div>
        </div>
      </header>

      {/* BUSCADOR + FILTRO */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="text-gray-600 text-sm">Buscar productos</label>
            <input
              type="text"
              placeholder="Buscar por nombre, descripción o categoría"
              className="w-full mt-1 px-4 py-2 border rounded-lg shadow-sm"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="categoriaSelect" className="text-gray-600 text-sm">
              Categoría
            </label>

            <select
              id="categoriaSelect"
              name="categoriaSelect"
              title="Seleccionar categoría"
              className="w-full mt-1 px-4 py-2 border rounded-lg shadow-sm"
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            >
              <option value="todas">Todas las categorías</option>
              {categoriasDisponibles.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* PRODUCTOS + CARRITO */}
      <main className="max-w-7xl mx-auto px-4 py-10 flex gap-6">

        {/* PRODUCTOS */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productos.map((p) => (
            <ProductoCard
              key={p.id}
              producto={p}
              autenticado={autenticado}
              cantidadEnCarrito={carrito?.items.find((i) => i.producto_id === p.id)?.cantidad || 0}
              onAgregado={cargarCarrito}
            />
          ))}
        </div>

        {/* CARRITO LATERAL */}
        {autenticado && carrito && (
          <div className="hidden lg:block w-80 bg-white shadow-lg rounded-xl p-5 h-fit sticky top-10">

            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold">Tu carrito</h2>

              <button
                onClick={vaciarCarrito}
                className="text-red-600 text-sm hover:underline"
              >
                Vaciar
              </button>
            </div>

            {carrito.items.length === 0 ? (
              <p className="text-gray-500">Carrito vacío.</p>
            ) : (
              <>
                {carrito.items.map((item) => (
                  <div key={item.producto_id} className="border-b pb-3 mb-3 text-sm">

                    <p className="font-semibold">{item.nombre}</p>

                    <div className="flex items-center gap-3 my-2">

                      <button
                        onClick={() => disminuirCantidad(item.producto_id, item.cantidad)}
                        className="w-7 h-7 flex items-center justify-center rounded-full border text-lg"
                      >
                        –
                      </button>

                      <span className="font-semibold">{item.cantidad}</span>

                      <button
                        onClick={() => incrementarCantidad(item.producto_id, item.cantidad)}
                        className="w-7 h-7 flex items-center justify-center rounded-full border text-lg"
                      >
                        +
                      </button>
                    </div>

                    <p className="text-gray-600">${item.precio} c/u</p>

                    <p className="font-bold text-gray-800">
                      Subtotal: ${item.subtotal.toFixed(2)}
                    </p>

                    <button
                      onClick={() => quitarProducto(item.producto_id)}
                      className="text-red-500 text-xs hover:underline mt-1"
                    >
                      Quitar
                    </button>

                  </div>
                ))}

                <div className="mt-3 text-sm">
                  <p>Subtotal: ${carrito.subtotal.toFixed(2)}</p>
                  <p>IVA: ${carrito.iva.toFixed(2)}</p>
                  <p>Envío: ${carrito.envio.toFixed(2)}</p>
                  <p className="font-bold text-lg mt-2">
                    Total: ${carrito.total.toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={() => router.push('/finalizar')}
                  className="w-full bg-black text-white py-2 mt-4 rounded-lg hover:bg-gray-900"
                >
                  Finalizar compra
                </button>
              </>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
