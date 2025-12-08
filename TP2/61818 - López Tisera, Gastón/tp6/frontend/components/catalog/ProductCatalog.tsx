/*
  Catálogo de productos con filtros y acciones sobre el carrito.
*/

"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/useCart";
import type { Producto } from "@/types/product";

const ALL_CATEGORIES_VALUE = "__all__";

interface ProductCatalogProps {
  productos: Producto[];
  categorias: string[];
  totalCatalogo: number;
  filters: {
    search?: string;
    categoria?: string;
  };
}

interface FeedbackMessage {
  type: "success" | "error";
  message: string;
}

export function ProductCatalog({
  productos,
  categorias,
  totalCatalogo,
  filters,
}: ProductCatalogProps): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const { addItem, loading: cartLoading } = useCart();

  const [searchValue, setSearchValue] = useState(filters.search ?? "");
  const [selectedCategory, setSelectedCategory] = useState(
    filters.categoria ?? ALL_CATEGORIES_VALUE,
  );
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [pendingProductId, setPendingProductId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSearchValue(filters.search ?? "");
  }, [filters.search]);

  useEffect(() => {
    setSelectedCategory(filters.categoria ?? ALL_CATEGORIES_VALUE);
  }, [filters.categoria]);

  const categoryOptions = useMemo(() => {
    return [ALL_CATEGORIES_VALUE, ...categorias];
  }, [categorias]);

  const hasActiveFilters =
    (filters.search && filters.search.trim().length > 0) ||
    (filters.categoria && filters.categoria.length > 0);

  const navigateWithFilters = (nextFilters: { search?: string; categoria?: string }) => {
    const params = new URLSearchParams();

    if (nextFilters.search && nextFilters.search.trim().length > 0) {
      params.set("search", nextFilters.search.trim());
    }

    if (nextFilters.categoria && nextFilters.categoria !== ALL_CATEGORIES_VALUE) {
      params.set("categoria", nextFilters.categoria);
    }

    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname);
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigateWithFilters({
      search: searchValue,
      categoria:
        selectedCategory === ALL_CATEGORIES_VALUE ? undefined : selectedCategory,
    });
  };

  const handleCategoryChange = (category: string) => {
    const normalizedCategory =
      category === ALL_CATEGORIES_VALUE ? undefined : category;

    setSelectedCategory(category);
    navigateWithFilters({
      search: searchValue,
      categoria: normalizedCategory,
    });
  };

  const handleReset = () => {
    setSearchValue("");
    setSelectedCategory(ALL_CATEGORIES_VALUE);
    navigateWithFilters({});
  };

  const handleAddToCart = async (producto: Producto) => {
    setFeedback(null);
    setPendingProductId(producto.id);
    try {
      await addItem({ producto_id: producto.id, cantidad: 1 });
      setFeedback({
        type: "success",
        message: `${producto.titulo} se agregó al carrito.`,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo agregar el producto al carrito.";
      setFeedback({
        type: "error",
        message,
      });
    } finally {
      setPendingProductId(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-blue-600">
              Descubrí nuestros productos
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Catálogo de compras
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Buscá por categoría o palabra clave y agregá lo que necesites al carrito.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:flex-row">
            <div className="flex flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-slate-500" aria-hidden="true">
                🔍
              </span>
              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Buscar productos por nombre o descripción..."
                className="border-none bg-transparent p-0 shadow-none focus-visible:ring-0"
                aria-label="Buscar productos"
              />
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full whitespace-nowrap md:w-auto"
            >
              {isPending ? "Buscando..." : "Aplicar filtros"}
            </Button>

            {hasActiveFilters && (
              <Button
                type="button"
                onClick={handleReset}
                disabled={isPending}
                className="w-full whitespace-nowrap bg-white text-slate-700 hover:bg-slate-100 md:w-auto"
              >
                Limpiar filtros
              </Button>
            )}
          </form>

          <div className="flex flex-wrap items-center gap-2">
            {categoryOptions.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryChange(category)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  selectedCategory === category
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-600 hover:text-blue-600"
                }`}
                disabled={isPending}
              >
                {category === ALL_CATEGORIES_VALUE ? "Todas las categorías" : category}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Mostrando{" "}
              <span className="font-semibold text-slate-900">{productos.length}</span>{" "}
              de {totalCatalogo} productos disponibles
            </span>
            {feedback && (
              <span
                className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-medium ${
                  feedback.type === "success"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {feedback.message}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        {productos.length === 0 ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <span className="text-4xl" aria-hidden="true">
              🛒
            </span>
            <h2 className="mt-4 text-xl font-semibold text-slate-900">
              No encontramos resultados
            </h2>
            <p className="mt-2 max-w-md text-sm text-slate-600">
              Probá ajustando la búsqueda o eligiendo otra categoría para ver más
              productos disponibles.
            </p>
            {hasActiveFilters ? (
              <Button type="button" onClick={handleReset} className="mt-6">
                Restablecer filtros
              </Button>
            ) : null}
          </div>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {productos.map((producto) => (
              <ProductCard
                key={producto.id}
                producto={producto}
                onAddToCart={() => handleAddToCart(producto)}
                isAdding={pendingProductId === producto.id && cartLoading}
              />
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

