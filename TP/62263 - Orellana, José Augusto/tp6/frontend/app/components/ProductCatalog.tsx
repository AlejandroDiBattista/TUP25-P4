'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, Minus, Plus, Search } from 'lucide-react';
import ProductoCard from './ProductoCard';
import { Carrito, CarritoItem, Producto, Usuario } from '../types';
import { calcularEnvio, IVA_TASA } from '../lib/precios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const TODAS = 'Todas las categorías';

interface ProductCatalogProps {
  productos: Producto[];
  usuario: Usuario | null;
  carrito: Carrito | null;
}

export default function ProductCatalog({ productos, usuario, carrito }: ProductCatalogProps) {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(TODAS);
  const [carritoActual, setCarritoActual] = useState<Carrito | null>(carrito);
  const [productoEnProceso, setProductoEnProceso] = useState<number | null>(null);
  const [accionGlobal, setAccionGlobal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setCarritoActual(carrito);
  }, [carrito]);

  const categorias = useMemo(() => {
    const unicas = new Set(productos.map((producto) => producto.categoria));
    return [TODAS, ...Array.from(unicas).sort((a, b) => a.localeCompare(b))];
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return productos.filter((producto) => {
      const coincideCategoria =
        categoriaSeleccionada === TODAS || producto.categoria === categoriaSeleccionada;

      const coincideBusqueda =
        termino.length === 0 ||
        producto.titulo.toLowerCase().includes(termino) ||
        producto.descripcion.toLowerCase().includes(termino) ||
        producto.categoria.toLowerCase().includes(termino);

      return coincideCategoria && coincideBusqueda;
    });
  }, [busqueda, categoriaSeleccionada, productos]);

  const refrescarCarrito = useCallback(async () => {
    if (!usuario) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/carrito`, {
        cache: 'no-store',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('No se pudo obtener el carrito.');
      }

      const datos: Carrito = await response.json();
      setCarritoActual(datos);
    } catch (error) {
      console.error('Error al actualizar el carrito:', error);
    }
  }, [usuario]);

  const manejarAgregar = useCallback(
    async (producto: Producto) => {
      if (!usuario) {
        return;
      }

      const itemEnCarrito = carritoActual?.items.find((item) => item.producto_id === producto.id);
      if (itemEnCarrito && itemEnCarrito.cantidad >= producto.existencia) {
        return;
      }

      setProductoEnProceso(producto.id);
      try {
        const response = await fetch(`${API_URL}/carrito`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            producto_id: producto.id,
            cantidad: 1,
          }),
        });

        if (!response.ok) {
          throw new Error('No se pudo agregar el producto.');
        }

        await refrescarCarrito();
      } catch (error) {
        console.error('Error al agregar al carrito:', error);
      } finally {
        setProductoEnProceso(null);
      }
    },
    [usuario, carritoActual, refrescarCarrito]
  );

  const manejarActualizarCantidad = useCallback(
    async (item: CarritoItem, nuevaCantidad: number) => {
      if (!usuario || !carritoActual || nuevaCantidad === item.cantidad) {
        return;
      }

      if (nuevaCantidad > item.producto.existencia) {
        return;
      }

      setProductoEnProceso(item.producto_id);
      try {
        if (nuevaCantidad <= 0) {
          await fetch(`${API_URL}/carrito/${item.producto_id}`, {
            method: 'DELETE',
            credentials: 'include',
          });
        } else if (nuevaCantidad > item.cantidad) {
          const diferencia = nuevaCantidad - item.cantidad;
          await fetch(`${API_URL}/carrito`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              producto_id: item.producto_id,
              cantidad: diferencia,
            }),
          });
        } else {
          await fetch(`${API_URL}/carrito/${item.producto_id}`, {
            method: 'DELETE',
            credentials: 'include',
          });

          await fetch(`${API_URL}/carrito`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              producto_id: item.producto_id,
              cantidad: nuevaCantidad,
            }),
          });
        }

        await refrescarCarrito();
      } catch (error) {
        console.error('Error al modificar cantidad:', error);
      } finally {
        setProductoEnProceso(null);
      }
    },
    [usuario, carritoActual, refrescarCarrito]
  );

  const manejarVaciar = useCallback(async () => {
    if (!usuario || !carritoActual || carritoActual.items.length === 0) {
      return;
    }

    setAccionGlobal(true);
    try {
      await Promise.all(
        carritoActual.items.map((item) =>
          fetch(`${API_URL}/carrito/${item.producto_id}`, {
            method: 'DELETE',
            credentials: 'include',
          })
        )
      );

      await refrescarCarrito();
    } catch (error) {
      console.error('Error al vaciar el carrito:', error);
    } finally {
      setAccionGlobal(false);
    }
  }, [usuario, carritoActual, refrescarCarrito]);

  const carritoVacio = !carritoActual || carritoActual.items.length === 0;

  const subtotal = useMemo(() => {
    if (!carritoActual) {
      return 0;
    }

    return carritoActual.items.reduce((acum, item) => acum + item.producto.precio * item.cantidad, 0);
  }, [carritoActual]);

  const iva = subtotal * IVA_TASA;
  const envio = calcularEnvio(subtotal);
  const total = subtotal + iva + envio;

  const manejarContinuarCompra = useCallback(() => {
    if (carritoVacio) {
      return;
    }

    router.push('/checkout');
  }, [carritoVacio, router]);

  const carritoSection = usuario ? (
    <div className="flex h-fit flex-col gap-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {carritoVacio ? (
        <p className="text-sm text-slate-500">Tu carrito está vacío.</p>
      ) : (
        <div className="space-y-4">
          {carritoActual!.items.map((item) => {
            const itemTotal = item.producto.precio * item.cantidad;

            return (
              <div key={item.id} className="flex items-start gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  <Image
                    src={`${API_URL}/${item.producto.imagen}`}
                    alt={item.producto.titulo}
                    fill
                    className="object-contain p-2"
                    sizes="48px"
                    unoptimized
                  />
                </div>

                <div className="flex flex-1 flex-col gap-1">
                  <p className="text-sm font-semibold text-slate-900">{item.producto.titulo}</p>
                  <p className="text-xs text-slate-500">
                    {item.producto.precio.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}{' '}
                    c/u
                  </p>

                  <div className="mt-2 flex items-center gap-3">
                    <button
                      type="button"
                      className="flex size-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => manejarActualizarCantidad(item, item.cantidad - 1)}
                      disabled={productoEnProceso === item.producto_id || accionGlobal}
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="text-sm font-semibold text-slate-900">{item.cantidad}</span>
                    <button
                      type="button"
                      className="flex size-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => manejarActualizarCantidad(item, item.cantidad + 1)}
                      disabled={
                        productoEnProceso === item.producto_id ||
                        accionGlobal ||
                        item.cantidad >= item.producto.existencia
                      }
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                </div>

                <span className="text-sm font-semibold text-slate-900">
                  {itemTotal.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-3 rounded-lg bg-slate-50 p-4">
        <div className="flex justify-between text-sm text-slate-600">
          <span>Subtotal</span>
          <span>{subtotal.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between text-sm text-slate-600">
          <span>IVA</span>
          <span>{iva.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between text-sm text-slate-600">
          <span>Envío</span>
          <span>{envio.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between text-base font-semibold text-slate-900">
          <span>Total</span>
          <span>{total.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          className="h-11 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={manejarVaciar}
          disabled={carritoVacio || accionGlobal || productoEnProceso !== null}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="h-11 rounded-lg bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-900/90 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={manejarContinuarCompra}
          disabled={carritoVacio || accionGlobal}
        >
          Continuar compra
        </button>
      </div>
    </div>
  ) : (
    <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
      Inicia sesión para ver y editar tu carrito.
    </div>
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar..."
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-600 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-200"
          />
        </div>

        <div className="relative w-full lg:w-64">
          <select
            value={categoriaSeleccionada}
            onChange={(event) => setCategoriaSeleccionada(event.target.value)}
            className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-600 shadow-sm transition focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-200"
          >
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          {productosFiltrados.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              No se encontraron productos que coincidan con la búsqueda.
            </div>
          ) : (
            productosFiltrados.map((producto) => {
              const itemEnCarrito = carritoActual?.items.find((item) => item.producto_id === producto.id);
              const sinStockDisponible = Boolean(
                itemEnCarrito && itemEnCarrito.cantidad >= producto.existencia
              );

              return (
                <ProductoCard
                  key={producto.id}
                  producto={producto}
                  onAgregar={usuario ? manejarAgregar : undefined}
                  deshabilitarAccion={
                    accionGlobal || productoEnProceso === producto.id || sinStockDisponible
                  }
                />
              );
            })
          )}
        </div>

        <aside className="hidden h-fit lg:block">{carritoSection}</aside>
      </div>

      <div className="lg:hidden">{carritoSection}</div>
    </section>
  );
}
