"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/componentsShadCN/ui/button";
import { Input } from "@/componentsShadCN/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/componentsShadCN/ui/select";
import ProductoCard from "./ProductoCard";
import { obtenerProductos } from "../services/productos";
import type { Producto } from "../types";
import { cn } from "@/lib/utils";

interface ProductosExplorerProps {
  initialProducts: Producto[];
  categories: string[];
}

const DEFAULT_CATEGORY = "todas";
const DEFAULT_IVA_RATE = 0.21;
const ELECTRONICS_IVA_RATE = 0.1;
const ELECTRONICS_CATEGORY = "electrónica";
const SHIPPING_FLAT = 50;
const FREE_SHIPPING_THRESHOLD = 1000;
const CART_STORAGE_KEY = "cartItems";

interface CartItem {
  producto: Producto;
  cantidad: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);

export default function ProductosExplorer({ initialProducts, categories }: ProductosExplorerProps) {
  const [productos, setProductos] = useState<Producto[]>(initialProducts);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState<string>(DEFAULT_CATEGORY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const requestIdRef = useRef(0);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const refreshAuthState = () => {
      const token = window.localStorage.getItem("token");
      setIsAuthenticated(Boolean(token));

      if (!token) {
        setCartItems([]);
        window.localStorage.removeItem(CART_STORAGE_KEY);
        return;
      }

      const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        try {
          const parsed: CartItem[] = JSON.parse(storedCart);
          setCartItems(parsed);
        } catch (parseError) {
          if (process.env.NODE_ENV !== "production") {
            console.error("No se pudo leer el carrito guardado", parseError);
          }
          window.localStorage.removeItem(CART_STORAGE_KEY);
        }
      }
    };

    refreshAuthState();
    window.addEventListener("storage", refreshAuthState);
    window.addEventListener("focus", refreshAuthState);

    return () => {
      window.removeEventListener("storage", refreshAuthState);
      window.removeEventListener("focus", refreshAuthState);
    };
  }, []);

  // Sincronizamos el carrito en memoria con localStorage.
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (!isAuthenticated) {
      return;
    }
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems, isAuthenticated]);

  const fetchProductos = async (overrides?: { categoria?: string; busqueda?: string }) => {
    const nextCategoria = overrides?.categoria ?? categoria;
    const nextBusqueda = overrides?.busqueda ?? busqueda;
    const filtros: { categoria?: string; busqueda?: string } = {};

    if (nextCategoria && nextCategoria !== DEFAULT_CATEGORY) {
      filtros.categoria = nextCategoria;
    }

    if (nextBusqueda.trim() !== "") {
      filtros.busqueda = nextBusqueda.trim();
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const data = await obtenerProductos(filtros);
      if (requestId === requestIdRef.current) {
        setProductos(data);
      }
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Error al obtener productos", error);
      }
      if (requestId === requestIdRef.current) {
        setError("No pudimos cargar los productos. Intenta nuevamente.");
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void fetchProductos();
  };

  const handleCategoriaChange = (value: string) => {
    setCategoria(value);
    void fetchProductos({ categoria: value });
  };

  const handleAddToCart = (producto: Producto) => {
    setCartItems((items) => {
      const existing = items.find((item) => item.producto.id === producto.id);
      if (existing) {
        if (existing.cantidad >= producto.existencia) {
          return items;
        }
        return items.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item,
        );
      }
      return [...items, { producto, cantidad: 1 }];
    });
  };

  const handleDecrease = (productoId: number) => {
    setCartItems((items) =>
      items
        .map((item) =>
          item.producto.id === productoId
            ? { ...item, cantidad: item.cantidad - 1 }
            : item,
        )
        .filter((item) => item.cantidad > 0),
    );
  };

  const handleIncrease = (producto: Producto) => {
    setCartItems((items) =>
      items.map((item) => {
        if (item.producto.id !== producto.id) {
          return item;
        }
        if (item.cantidad >= producto.existencia) {
          return item;
        }
        return { ...item, cantidad: item.cantidad + 1 };
      }),
    );
  };

  const handleRemove = (productoId: number) => {
    setCartItems((items) => items.filter((item) => item.producto.id !== productoId));
  };

  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0),
    [cartItems],
  );
  const iva = useMemo(
    () =>
      cartItems.reduce((acc, item) => {
        const rate =
          item.producto.categoria.toLowerCase() === ELECTRONICS_CATEGORY
            ? ELECTRONICS_IVA_RATE
            : DEFAULT_IVA_RATE;
        return acc + item.producto.precio * item.cantidad * rate;
      }, 0),
    [cartItems],
  );
  const totalAntesEnvio = subtotal + iva;
  const envio = cartItems.length === 0
    ? 0
    : totalAntesEnvio > FREE_SHIPPING_THRESHOLD
      ? 0
      : SHIPPING_FLAT;
  const total = subtotal + iva + envio;

  return (
    <section className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="20" y1="20" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <Input
            type="search"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar..."
            aria-label="Buscar productos"
            className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-12 pr-4 text-sm text-gray-900 shadow-sm focus-visible:border-blue-500 focus-visible:ring-blue-100"
          />
        </div>
        <div className="w-full lg:w-64">
          <span className="sr-only" id="categoria-label">
            Filtrar por categoría
          </span>
          <Select value={categoria} onValueChange={handleCategoriaChange}>
            <SelectTrigger aria-labelledby="categoria-label" className="h-12 w-full rounded-xl border border-gray-200 bg-white text-sm text-gray-900">
              <SelectValue placeholder="Selecciona categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={DEFAULT_CATEGORY}>Todas las categorías</SelectItem>
              {categories.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <button type="submit" className="hidden">
          Buscar
        </button>
      </form>

      {loading && (
        <p className="text-sm text-gray-500">Cargando productos...</p>
      )}

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && productos.length === 0 && (
        <p className="rounded-lg border border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-600">
          No encontramos productos que coincidan con tu búsqueda.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2.5fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          {productos.map((producto) => (
            <ProductoCard
              key={producto.id}
              producto={producto}
              onAdd={handleAddToCart}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>

        <aside className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Carrito</h2>
          <p className="text-sm text-gray-500">Revisa tus productos antes de comprar.</p>

          {!isAuthenticated && (
            <p className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
              Inicia sesión para ver y editar tu carrito.
            </p>
          )}

          {isAuthenticated && cartItems.length === 0 && (
            <p className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
              Aún no agregaste productos.
            </p>
          )}

          {isAuthenticated && cartItems.length > 0 && (
            <div className="mt-6 space-y-5">
              <ul className="space-y-4">
                {cartItems.map(({ producto, cantidad }) => (
                  <li key={producto.id} className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/${producto.imagen}`}
                          alt={producto.titulo}
                          fill
                          sizes="56px"
                          className="object-contain p-2"
                          unoptimized
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{producto.titulo}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(producto.precio)} c/u</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            className="rounded-full"
                            onClick={() => handleDecrease(producto.id)}
                          >
                            -
                          </Button>
                          <span className="min-w-[2ch] text-center text-sm font-semibold text-gray-900">{cantidad}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            className="rounded-full"
                            onClick={() => handleIncrease(producto)}
                            disabled={cantidad >= producto.existencia}
                          >
                            +
                          </Button>
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="ml-2 px-0 text-xs font-medium text-red-600 hover:text-red-700"
                            onClick={() => handleRemove(producto.id)}
                          >
                            Quitar
                          </Button>
                        </div>
                      </div>
                    </div>
                    <p className="pt-1 text-sm font-semibold text-gray-900">{formatCurrency(producto.precio * cantidad)}</p>
                  </li>
                ))}
              </ul>

              <div className="space-y-2 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA estimado</span>
                  <span>{formatCurrency(iva)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span>{envio === 0 ? "Gratis" : formatCurrency(envio)}</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-base font-semibold text-gray-900">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-full border border-gray-300 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setCartItems([]);
                    if (typeof window !== "undefined") {
                      window.localStorage.removeItem(CART_STORAGE_KEY);
                    }
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="default"
                  className={cn(
                    "w-full rounded-full py-3 text-sm font-semibold",
                    cartItems.length > 0
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "bg-gray-200 text-gray-500 hover:bg-gray-200"
                  )}
                  disabled={cartItems.length === 0}
                  onClick={() => {
                    if (cartItems.length === 0) {
                      return;
                    }
                    router.push("/checkout");
                  }}
                >
                  Continuar compra
                </Button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
