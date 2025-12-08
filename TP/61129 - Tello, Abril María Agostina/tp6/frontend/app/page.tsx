"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { obtenerProductos } from './services/productos';
import NavBarClient from "./components/NavBarClient";
import { Producto } from './types';

export default function Home() {
  const [mensajeCarrito, setMensajeCarrito] = useState<{ id: number, mensaje: string } | null>(null);
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [busqueda, setBusqueda] = useState<string>("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("");
  const [carrito, setCarrito] = useState<(Producto & { cantidad: number })[]>([]);
  const [productosStock, setProductosStock] = useState<Record<number, number>>({});
  const [usuario, setUsuario] = useState<{ nombre: string; email: string } | null>(null);

  const obtenerClaveCarrito = () => {
    return usuario?.email ? `carrito_${usuario.email}` : "carrito";
  };

  const cargarCarritoUsuario = () => {
    if (typeof window !== "undefined") {
      const claveCarrito = obtenerClaveCarrito();
      const carritoGuardado = localStorage.getItem(claveCarrito);
      if (carritoGuardado) {
        try {
          const carritoParseado = JSON.parse(carritoGuardado);
          if (Array.isArray(carritoParseado)) {
            setCarrito(carritoParseado);
          }
        } catch {}
      } else {
        setCarrito([]); 
      }
    }
  };

  const guardarCarritoUsuario = (nuevoCarrito: (Producto & { cantidad: number })[]) => {
    if (typeof window !== "undefined") {
      const claveCarrito = obtenerClaveCarrito();
      localStorage.setItem(claveCarrito, JSON.stringify(nuevoCarrito));
    }
  };

  function actualizarStock(nuevosProductos: Producto[]) {
    let stockMap: Record<number, number> = {};
    nuevosProductos.forEach((p: Producto) => {
      stockMap[p.id] = p.existencia || 0;
    });
    setProductosStock(stockMap);
  }

  useEffect(() => {
    const syncUsuario = () => {
      const user = typeof window !== "undefined" ? localStorage.getItem("usuario") : null;
      if (user) {
        setUsuario(JSON.parse(user));
      } else {
        setUsuario(null);
        setCarrito([]); 
      }
    };
    syncUsuario();
    window.addEventListener("storage", syncUsuario);

    return () => window.removeEventListener("storage", syncUsuario);
  }, []);

  useEffect(() => {
    cargarCarritoUsuario();
  }, [usuario?.email]);

  useEffect(() => {
    obtenerProductos().then((data: Producto[]) => {
      setProductos(data);
      setCategorias(Array.from(new Set(data.map((p: Producto) => p.categoria).filter((cat): cat is string => typeof cat === 'string'))));
      let stockMap: Record<number, number> = {};
      data.forEach((p: Producto) => {
        const stockOriginal = p.existencia || 0;
        const cantidadEnCarrito = (carrito.find((item) => item.id === p.id)?.cantidad) ?? 0;
        stockMap[p.id] = stockOriginal - cantidadEnCarrito;
      });
      setProductosStock(stockMap);
    });
  }, [carrito]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        obtenerProductos().then((data: Producto[]) => {
          setProductos(data);
          actualizarStock(data);
        });
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'carrito' && e.newValue === '[]') {
        setTimeout(() => {
          obtenerProductos().then((data: Producto[]) => {
            setProductos(data);
            actualizarStock(data);
          });
        }, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const productosFiltrados = productos.filter((p: Producto) =>
    (categoriaFiltro ? p.categoria === categoriaFiltro : true) &&
    (busqueda ? (p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || p.titulo?.toLowerCase().includes(busqueda.toLowerCase())) : true)
  );

  function agregarAlCarrito(producto: Producto) {
    if (!usuario) {
      setMensajeCarrito({ id: producto.id, mensaje: "Debe iniciar sesión o registrarse para agregar productos al carrito." });
      return;
    }
    setCarrito((prev: (Producto & { cantidad: number })[]) => {
      const existe = prev.find((item) => item.id === producto.id);
      const stockOriginal = productos.find((p) => p.id === producto.id)?.existencia ?? 0;
      const cantidadEnCarrito = existe?.cantidad ?? 0;
      if (cantidadEnCarrito >= stockOriginal) return prev;
      let nuevoCarrito;
      if (existe) {
        nuevoCarrito = prev.map((p) => p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p);
      } else {
        nuevoCarrito = [...prev, { ...producto, cantidad: 1 }];
      }
      setProductosStock((s) => ({ ...s, [producto.id]: stockOriginal - (cantidadEnCarrito + 1) }));
      guardarCarritoUsuario(nuevoCarrito);
      setMensajeCarrito(null);
      return nuevoCarrito;
    });
  }

  function cambiarCantidad(id: number, delta: number) {
    setCarrito((prev: (Producto & { cantidad: number })[]) => {
      const nuevoCarrito = prev.map((item: Producto & { cantidad: number }) => {
        if (item.id === id) {
          const stockOriginal = productos.find((p: Producto) => p.id === id)?.existencia ?? 0;
          const stockDisponible = productosStock[id] ?? stockOriginal;
          const nuevaCantidad = item.cantidad + delta;
          if (nuevaCantidad < 1 || nuevaCantidad > stockOriginal) return item;
          if (delta > 0 && stockDisponible <= 0) return item;
          if (delta > 0 && item.cantidad >= stockOriginal) return item;
          if (delta < 0 && item.cantidad <= 1) return item;
          setProductosStock((s: Record<number, number>) => ({ ...s, [id]: stockDisponible - delta }));
          return { ...item, cantidad: nuevaCantidad };
        }
        return item;
      });
      guardarCarritoUsuario(nuevoCarrito);
      return nuevoCarrito;
    });
  }

  function eliminarDelCarrito(id: number) {
    setCarrito((prev: (Producto & { cantidad: number })[]) => {
      const nuevoCarrito = prev.filter((item) => item.id !== id);
      guardarCarritoUsuario(nuevoCarrito);
      
      const productoEliminado = prev.find((item) => item.id === id);
      if (productoEliminado) {
        const stockOriginal = productos.find((p: Producto) => p.id === id)?.existencia ?? 0;
        setProductosStock((s: Record<number, number>) => ({ ...s, [id]: stockOriginal }));
      }
      
      return nuevoCarrito;
    });
  }

  const subtotal = carrito.reduce((acc: number, item: Producto & { cantidad: number }) => acc + item.precio * item.cantidad, 0);
  const ivaPorProducto = carrito.map((item: Producto & { cantidad: number }) => {
    const esElectronico = (item.categoria?.toLowerCase() === "electrónica" || item.categoria?.toLowerCase() === "electronica");
    const ivaTasa = esElectronico ? 0.10 : 0.21;
    return item.precio * item.cantidad * ivaTasa;
  });
  const iva = ivaPorProducto.reduce((acc: number, v: number) => acc + v, 0);
  const envio = (carrito.length > 0 && (subtotal + iva) > 1000) ? 0 : (carrito.length > 0 ? 50 : 0);
  const total = subtotal + iva + envio;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBarClient />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-row gap-6 items-start">
          <div className="flex-1">
            <div className="flex gap-4 mb-6">
              <input type="text" placeholder="Buscar..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="bg-white border border-gray-300 rounded-lg px-4 py-3 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition" />
              <select className="bg-white border border-gray-300 rounded-lg px-4 py-3 w-full max-w-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition" style={{ minWidth: '200px' }} value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)}>
                <option value="">Todas las categorías</option>
                {categorias.map((cat: string) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-6">
              {productosFiltrados.map((producto: Producto) => {
                const stockOriginal = producto.existencia ?? 0;
                const cantidadEnCarrito = carrito.find((item) => item.id === producto.id)?.cantidad ?? 0;
                const stockDisponible = stockOriginal - cantidadEnCarrito;
                return (
                  <div key={producto.id} className="bg-white rounded-lg shadow flex flex-row items-center p-4">
                    <img src={`http://localhost:8000/${producto.imagen}`} alt={producto.titulo} className="w-32 h-32 object-contain rounded mr-6 bg-gray-100" />
                    <div className="flex-1">
                      <h2 className="text-xl font-bold mb-1">
                        {producto.nombre ? (
                          <span className="block text-gray-900">{producto.nombre}</span>
                        ) : null}
                        <span className="block text-gray-900">{producto.titulo}</span>
                      </h2>
                      <p className="text-gray-600 mb-2">{producto.descripcion}</p>
                      <div className="text-sm text-gray-500 mb-2">Categoría: {producto.categoria}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2 min-w-[120px]">
                      <div className="text-2xl font-bold text-gray-800">${producto.precio.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">Disponible: {stockDisponible}</div>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded font-bold shadow hover:bg-transparent hover:text-blue-600 border border-blue-600 transition active:scale-95 disabled:opacity-50" onClick={() => agregarAlCarrito(producto)} disabled={stockDisponible <= 0}>Agregar al carrito</button>
                      {mensajeCarrito && mensajeCarrito.id === producto.id && (
                        <div className="text-xs text-red-600 font-bold mt-2">{mensajeCarrito.mensaje}</div>
                      )}
                      {stockDisponible <= 0 && (
                        <div className="text-xs text-red-600 font-bold mt-2">Sin stock</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <aside className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 h-fit border border-gray-200" style={{ minWidth: '380px' }}>
            {!usuario ? (
              <div className="text-gray-600 text-center">Inicie sesión para ver y editar el carrito.</div>
            ) : carrito.length === 0 ? (
              <div className="text-gray-600 text-center">Su carrito está vacío.</div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Tu Carrito</h3>
                <div className="mb-6 flex flex-col gap-4">
                  {carrito.map((item: Producto & { cantidad: number }) => {
                    const stockOriginal = item.existencia ?? 0;
                    const stockDisponible = productosStock[item.id] ?? stockOriginal;
                    const esElectronico = (item.categoria?.toLowerCase() === "electrónica" || item.categoria?.toLowerCase() === "electronica");
                    const ivaTasa = esElectronico ? 0.10 : 0.21;
                    const ivaItem = item.precio * item.cantidad * ivaTasa;
                    return (
                      <div key={item.id} className="relative bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                        <button
                          onClick={() => eliminarDelCarrito(item.id)}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold transition-colors shadow-md"
                          title="Eliminar producto"
                        >
                          ×
                        </button>
                        
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <img 
                              src={`http://localhost:8000/${item.imagen}`} 
                              alt={item.titulo} 
                              className="w-16 h-16 object-contain rounded-lg bg-white border border-gray-300 shadow-sm" 
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">
                              {item.nombre || item.titulo}
                            </h4>
                            <p className="text-xs text-gray-500 mb-2">${item.precio.toFixed(2)} c/u</p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-600">Cantidad:</span>
                                <div className="flex items-center bg-gray-100 rounded-lg">
                                  <button 
                                    className="w-7 h-7 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-l-lg flex items-center justify-center text-sm font-bold transition-colors"
                                    onClick={() => cambiarCantidad(item.id, -1)}
                                    disabled={item.cantidad <= 1}
                                  >
                                    -
                                  </button>
                                  <span className="w-8 h-7 bg-white flex items-center justify-center text-sm font-semibold border-x border-gray-200">
                                    {item.cantidad}
                                  </span>
                                  <button 
                                    className="w-7 h-7 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-r-lg flex items-center justify-center text-sm font-bold transition-colors disabled:opacity-50"
                                    onClick={() => cambiarCantidad(item.id, 1)}
                                    disabled={item.cantidad >= stockOriginal}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="text-lg font-bold text-gray-900">
                                  ${(item.precio * item.cantidad).toFixed(2)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  IVA ({esElectronico ? "10%" : "21%"}): ${ivaItem.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>IVA:</span>
                    <span>${iva.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Envío:</span>
                    <span>{envio === 0 ? 'Gratis' : `$${envio.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="flex gap-3">
                    <button
                      className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold border border-gray-300 hover:bg-gray-200 transition-colors"
                      onClick={() => {
                        setCarrito([]);
                        localStorage.removeItem("carrito");
                        setProductosStock((s) => {
                          const nuevoStock = { ...s };
                          carrito.forEach((item: Producto & { cantidad: number }) => {
                            const stockOriginal = item.existencia ?? 0;
                            nuevoStock[item.id] = stockOriginal;
                          });
                          return nuevoStock;
                        });
                      }}
                    >
                      Vaciar Carrito
                    </button>
                    <button
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-lg"
                      onClick={() => {
                        guardarCarritoUsuario(carrito);
                        router.push('/checkout');
                      }}
                    >
                      Ir al Checkout →
                    </button>
                  </div>
                </div>
              </>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}