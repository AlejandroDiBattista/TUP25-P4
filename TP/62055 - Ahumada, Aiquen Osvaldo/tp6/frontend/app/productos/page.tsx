"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { obtenerProductos } from "../services/productos";
import ProductoCard from "../components/ProductoCard";
import Carrito from "../components/Carrito";
import { useAuth } from "../hooks/useAuth";
import { Producto } from "../types";

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { isAuthenticated } = useAuth();

  const debouncedSearch = useMemo(() => searchTerm.trim(), [searchTerm]);

  const cargarProductos = useCallback(() => {
    setIsSearching(true);
    obtenerProductos(debouncedSearch || undefined)
      .then((items) => {
        setProductos(items);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsSearching(false));
  }, [debouncedSearch]);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const handler = () => cargarProductos();
    window.addEventListener("carrito-actualizado", handler);
    return () => {
      window.removeEventListener("carrito-actualizado", handler);
    };
  }, [cargarProductos]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-8 bg-white min-h-screen">
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-4 text-black">Productos</h1>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
        <div className="mb-6">
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar productos por nombre o descripción"
            className="w-full md:w-1/2 lg:w-1/3 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 text-gray-900"
          />
          {isSearching && <p className="text-sm text-gray-500 mt-2">Buscando...</p>}
        </div>
        {!isAuthenticated && (
          <div className="bg-blue-100 text-blue-700 p-2 rounded mb-4 text-black">
            Inicia sesión para ver y editar tu carrito.
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {productos.length === 0 ? (
            <p className="text-black">No hay productos disponibles.</p>
          ) : (
            productos.map((producto: any) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))
          )}
        </div>
      </div>
      {/* Carrito emergente a la derecha */}
      <div className="w-full lg:w-[400px]">
        {isAuthenticated ? <Carrito /> : (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-2">Debes iniciar sesión para ver el carrito</div>
        )}
      </div>
    </div>
  );
}
