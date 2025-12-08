'use client';

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition, useState } from "react";

import type { Producto } from "@/types/product";
import { ProductListHorizontal } from "./ProductListHorizontal";
import { CartSidebar } from "@/components/cart/CartSidebar";

interface ProductCatalogWithCartProps {
  productos: Producto[];
  categorias: string[];
  filters?: {
    search?: string;
    categoria?: string;
  };
}

export function ProductCatalogWithCart({
  productos,
  categorias,
  filters = {},
}: ProductCatalogWithCartProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(filters.search ?? "");

  const navigateWithFilters = (nextFilters: { search?: string; categoria?: string }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (nextFilters.search) {
      params.set("search", nextFilters.search);
    } else {
      params.delete("search");
    }

    if (nextFilters.categoria && nextFilters.categoria !== "all") {
      params.set("categoria", nextFilters.categoria);
    } else {
      params.delete("categoria");
    }

    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname);
    });
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    navigateWithFilters({ search: searchInput.trim(), categoria: filters.categoria });
  };

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    navigateWithFilters({
      search: filters.search,
      categoria: value === "all" ? undefined : value,
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Barra de filtros */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 pr-10 text-sm text-slate-900 outline-none focus:border-slate-400"
            />
            <svg
              className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <select
            value={filters.categoria ?? "all"}
            onChange={handleCategoryChange}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
          >
            <option value="all">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </form>
      </div>

      {/* Layout principal: productos + carrito */}
      <div className="flex flex-1">
        {/* Productos (izquierda, ~65%) */}
        <div className="w-[65%] overflow-y-auto bg-white p-6">
          <ProductListHorizontal productos={productos} />
        </div>

        {/* Carrito (derecha, ~35%) */}
        <div className="w-[35%] overflow-y-auto bg-slate-50">
          <CartSidebar />
        </div>
      </div>
    </div>
  );
}

