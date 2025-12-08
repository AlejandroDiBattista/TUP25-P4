"use client";

import { useState, useEffect } from "react";
import { getProductos } from "@/services/api";
import { Producto } from "@/types";
import ProductoCard from "@/components/ProductoCard";
import Carrito from "@/components/Carrito";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function Home() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const { cart } = useCart(); // Obtenemos el carrito del contexto

  useEffect(() => {
    // Cargar todas las categorías al montar el componente
    const fetchCategorias = async () => {
      try {
        const todosLosProductos = await getProductos();
        const categoriasUnicas = Array.from(new Set(todosLosProductos.map(p => p.categoria)));
        setCategorias(categoriasUnicas);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    };
    fetchCategorias();
  }, []);

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const data = await getProductos(searchQuery, selectedCategory);
      setProductos(data);
    } catch (error) {
      console.error("Error al buscar productos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, [searchQuery, selectedCategory, cart]); // Añadimos 'cart' a las dependencias

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna de Productos */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-6 text-white">Catálogo de Productos</h1>
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border rounded-lg px-4 py-2 w-full md:w-1/3 bg-black text-white"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border rounded-lg px-4 py-2 w-full md:w-1/4 bg-black text-white"
            >
              <option value="" className="bg-black text-white">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat} value={cat} className="bg-black text-white">{cat}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="text-center mt-8">Cargando productos...</p>
          ) : productos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {productos.map((producto) => (
                <ProductoCard key={producto.id} producto={producto} onProductUpdate={fetchProductos} />
              ))}
            </div>
          ) : (
            <p>No se encontraron productos que coincidan con tu búsqueda.</p>
          )}
        </div>

        {/* Columna del Carrito */}
        <div className="lg:col-span-1">
          {isAuthenticated ? (
            <Carrito />
          ) : (
            <div className="border rounded-lg p-4 mt-16 text-center bg-white shadow">
              <p className="text-gray-600">Inicia sesión para ver y editar tu carrito.</p>
            </div>
          )}
        </div>
      </div>
    );
}