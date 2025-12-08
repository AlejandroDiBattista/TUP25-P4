"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import ProductoCard from "./components/ProductoCard";
import type { CarritoDetalle, CarritoItem, Producto } from "./types";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AUTH_USER_UPDATED_EVENT } from "@/lib/auth";
import { cn } from "@/lib/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type LoadState = "idle" | "loading" | "error";

const mapCarritoDetalle = (payload: any): CarritoDetalle => ({
  items: Array.isArray(payload?.items) ? (payload.items as CarritoItem[]) : [],
  subtotal: Number(payload?.subtotal ?? 0),
  iva: Number(payload?.iva ?? 0),
  envio: Number(payload?.envio ?? 0),
  total: Number(payload?.total ?? 0),
});

export default function ProductsPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [estadoCarga, setEstadoCarga] = useState<LoadState>("idle");
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [token, setToken] = useState<string | null>(null);
  const [carrito, setCarrito] = useState<CarritoDetalle | null>(null);
  const [estadoCarrito, setEstadoCarrito] = useState<LoadState>("idle");
  const [accionCarritoId, setAccionCarritoId] = useState<number | null>(null);
  const [cancelandoCarrito, setCancelandoCarrito] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mensajeTipo, setMensajeTipo] = useState<"info" | "error">("info");
  const [addingId, setAddingId] = useState<number | null>(null);
  const router = useRouter();

  const updateMensaje = (texto: string | null, tipo: "info" | "error" = "info") => {
    setMensaje(texto);
    if (texto) {
      setMensajeTipo(tipo);
    }
  };

  useEffect(() => {
    const syncToken = () => {
      if (typeof window === "undefined") {
        return;
      }
      setToken(localStorage.getItem("token"));
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "token" || event.key === "usuario") {
        syncToken();
      }
    };

    const handleAuthEvent = (_event: Event) => syncToken();

    syncToken();
    window.addEventListener("storage", handleStorage);
    window.addEventListener(AUTH_USER_UPDATED_EVENT, handleAuthEvent);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(AUTH_USER_UPDATED_EVENT, handleAuthEvent);
    };
  }, []);

  useEffect(() => {
    const obtenerProductos = async () => {
      setEstadoCarga("loading");
      try {
        const response = await fetch(`${API_BASE_URL}/productos`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("No se pudieron cargar los productos");
        }
        const data = await response.json();
        setProductos(data);
        setEstadoCarga("idle");
      } catch (error) {
        console.error(error);
        setEstadoCarga("error");
      }
    };

    obtenerProductos();
  }, []);

  const fetchCarrito = useCallback(async () => {
    if (!token) {
      setCarrito(null);
      return;
    }

    setEstadoCarrito("loading");
    try {
      const response = await fetch(`${API_BASE_URL}/carrito`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("No se pudo obtener el carrito");
      }

      const data = await response.json();
      setCarrito(mapCarritoDetalle(data));
      setEstadoCarrito("idle");
    } catch (error) {
      console.error(error);
      setEstadoCarrito("error");
      const message =
        error instanceof Error ? error.message : "No se pudo cargar tu carrito";
      updateMensaje(message, "error");
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setCarrito(null);
      return;
    }
    fetchCarrito();
  }, [token, fetchCarrito]);

  const categorias = useMemo(() => {
    const unique = Array.from(
      new Set(productos.map((producto) => producto.categoria))
    ).sort();
    return ["todas", ...unique];
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    const termino = search.trim().toLowerCase();
    return productos.filter((producto) => {
      const coincideCategoria =
        categoria === "todas" ||
        producto.categoria.toLowerCase() === categoria.toLowerCase();
      const coincideBusqueda =
        termino.length === 0 ||
        `${producto.titulo} ${producto.descripcion}`
          .toLowerCase()
          .includes(termino);
      return coincideCategoria && coincideBusqueda;
    });
  }, [productos, search, categoria]);

  const handleAgregarAlCarrito = async (productoId: number) => {
    if (!token) {
      updateMensaje("Inicia sesion para agregar productos al carrito.", "error");
      return;
    }

    setAddingId(productoId);
    updateMensaje(null);
    try {
      const response = await fetch(`${API_BASE_URL}/carrito`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ producto_id: productoId, cantidad: 1 }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail ?? "No se pudo agregar el producto");
      }
      setCarrito(mapCarritoDetalle(data));
      setEstadoCarrito("idle");
      updateMensaje("Producto agregado al carrito.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ocurrio un error inesperado";
      updateMensaje(message, "error");
    } finally {
      setAddingId(null);
    }
  };

  const handleActualizarCantidad = async (productoId: number, nuevaCantidad: number) => {
    if (!token) {
      updateMensaje("Inicia sesion para modificar tu carrito.", "error");
      return;
    }

    if (nuevaCantidad < 0) {
      return;
    }

    setAccionCarritoId(productoId);
    updateMensaje(null);
    try {
      let response: Response;
      if (nuevaCantidad === 0) {
        response = await fetch(`${API_BASE_URL}/carrito/${productoId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        response = await fetch(`${API_BASE_URL}/carrito/${productoId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cantidad: nuevaCantidad }),
        });
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail ?? "No se pudo actualizar el carrito");
      }

      setCarrito(mapCarritoDetalle(data));
      updateMensaje(
        data.mensaje ?? (nuevaCantidad === 0 ? "Producto eliminado del carrito." : "Cantidad actualizada.")
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ocurrio un error inesperado";
      updateMensaje(message, "error");
    } finally {
      setAccionCarritoId(null);
    }
  };

  const handleCancelarCarrito = async () => {
    if (!token) {
      return;
    }

    setCancelandoCarrito(true);
    updateMensaje(null);
    try {
      const response = await fetch(`${API_BASE_URL}/carrito/cancelar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail ?? "No se pudo cancelar el carrito");
      }

      setCarrito(mapCarritoDetalle(data));
      updateMensaje(data.mensaje ?? "Tu carrito fue vaciado.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ocurrio un error inesperado";
      updateMensaje(message, "error");
    } finally {
      setCancelandoCarrito(false);
    }
  };

  const handleIrAlCheckout = () => {
    if (!token) {
      updateMensaje("Inicia sesion para finalizar tu compra.", "error");
      return;
    }
    if (!carrito || carrito.items.length === 0) {
      updateMensaje("Tu carrito está vacío.", "error");
      return;
    }
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <SiteHeader active="products" />
      <main className="mx-auto flex w-full max-w-6xl gap-6 px-6 py-10">
        <section className="flex-1 space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 3.5a5.5 5.5 0 013.863 9.409l3.114 3.114a.75.75 0 11-1.06 1.06l-3.114-3.114A5.5 5.5 0 119 3.5zm0 1.5a4 4 0 100 8 4 4 0 000-8z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <Input
                placeholder="Buscar..."
                className="h-12 rounded-2xl border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-600 placeholder:text-slate-400"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div>
              <select
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm lg:w-56"
                value={categoria}
                onChange={(event) => setCategoria(event.target.value)}
              >
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "todas"
                      ? "Todas las categorias"
                      : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {estadoCarga === "loading" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                Cargando productos...
              </div>
            )}
            {estadoCarga === "error" && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
                Error al cargar los productos. Intenta nuevamente mas tarde.
              </div>
            )}
            {estadoCarga === "idle" && productosFiltrados.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                No encontramos productos que coincidan con tu busqueda.
              </div>
            )}
            {productosFiltrados.map((producto) => (
              <ProductoCard
                key={producto.id}
                producto={producto}
                onAdd={() => handleAgregarAlCarrito(producto.id)}
                disabled={
                  producto.existencia === 0 || addingId === producto.id
                }
                loading={addingId === producto.id}
              />
            ))}
          </div>
        </section>

        <aside className="hidden w-[26rem] flex-shrink-0 lg:block">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {!token ? (
              <>
                <p className="text-sm text-slate-500">
                  Inicia sesion para ver y editar tu carrito.
                </p>
                <Button
                  asChild
                  className="mt-6 w-full rounded-full bg-slate-900 py-2 text-sm text-white hover:bg-slate-800"
                >
                  <Link href="/login">Iniciar sesion</Link>
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-slate-900">Tu carrito</p>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                    {carrito?.items.length ?? 0} items
                  </span>
                </div>
                {estadoCarrito === "loading" && (
                  <p className="mt-6 text-sm text-slate-500">Cargando tu carrito...</p>
                )}
                {estadoCarrito === "error" && (
                  <p className="mt-6 text-sm text-red-600">
                    No pudimos cargar tu carrito. Intenta nuevamente.
                  </p>
                )}
                {estadoCarrito === "idle" && carrito && carrito.items.length === 0 && (
                  <p className="mt-6 text-sm text-slate-500">
                    Todavia no tienes productos en tu carrito.
                  </p>
                )}

                {carrito && carrito.items.length > 0 && (
                  <>
                    <ul className="mt-6 space-y-4">
                      {carrito.items.map((item) => (
                        <li
                          key={item.producto_id}
                          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                        >
                          <div className="flex gap-4">
                            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                              <Image
                                src={`${API_BASE_URL}/${item.imagen}`}
                                alt={item.titulo}
                                fill
                                sizes="64px"
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <div className="flex flex-1 flex-col gap-1 text-sm">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="font-semibold text-slate-900 leading-snug">
                                    {item.titulo}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    ${item.precio_unitario.toFixed(2)} c/u
                                  </p>
                                </div>
                                <p className="text-base font-semibold text-slate-900">
                                  ${item.subtotal.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <span className="text-sm text-slate-600">Cantidad:</span>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                className="h-10 w-10 rounded-lg border-slate-200 bg-slate-50 text-base font-semibold text-slate-700 transition hover:bg-slate-900 hover:text-white"
                                onClick={() =>
                                  handleActualizarCantidad(item.producto_id, item.cantidad - 1)
                                }
                                disabled={accionCarritoId === item.producto_id}
                                aria-label={`Reducir ${item.titulo}`}
                              >
                                -
                              </Button>
                              <span className="w-6 text-center text-base font-semibold text-slate-900">
                                {item.cantidad}
                              </span>
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                className="h-10 w-10 rounded-lg border-slate-200 bg-slate-50 text-base font-semibold text-slate-700 transition hover:bg-slate-900 hover:text-white"
                                onClick={() =>
                                  handleActualizarCantidad(item.producto_id, item.cantidad + 1)
                                }
                                disabled={accionCarritoId === item.producto_id}
                                aria-label={`Incrementar ${item.titulo}`}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 space-y-3 text-sm text-slate-600">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-semibold text-slate-900">
                          ${carrito.subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>IVA</span>
                        <span className="font-semibold text-slate-900">
                          ${carrito.iva.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Envio</span>
                        <span className="font-semibold text-slate-900">
                          ${carrito.envio.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-base font-semibold text-slate-900">
                        <span>Total</span>
                        <span>${carrito.total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 bg-slate-50"
                        onClick={handleCancelarCarrito}
                        disabled={cancelandoCarrito}
                      >
                        {cancelandoCarrito ? "Cancelando..." : "Cancelar"}
                      </Button>
                      <Button
                        className="flex-1 bg-slate-900 text-white hover:bg-slate-800"
                        disabled={carrito.items.length === 0}
                        type="button"
                        onClick={handleIrAlCheckout}
                      >
                        Continuar compra
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}

            {mensaje && (
              <p
                className={cn(
                  "mt-4 rounded-xl px-4 py-3 text-sm",
                  mensajeTipo === "error"
                    ? "bg-red-50 text-red-600"
                    : "bg-emerald-50 text-emerald-600"
                )}
              >
                {mensaje}
              </p>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
