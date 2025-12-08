"use client";
import React, { useEffect, useState } from "react";
import ProductoCard from "./components/ProductoCard";
import CartSidebar from "./components/CartSidebar";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const [productos, setProductos] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("");
  const [categorias, setCategorias] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Ya no redirigimos, permitimos ver los productos sin autenticarse
    }
  }, [isAuthenticated, loading, router]);

  const cargarProductos = () => {
    fetch("http://localhost:8000/productos")
      .then(res => res.json())
      .then(data => {
        setProductos(data || []);
        const cats = Array.from(new Set(((data || []) as any[]).map((p: any) => p.categoria))) as string[];
        setCategorias(cats);
      })
      .catch(err => {
        console.error("Error cargando productos:", err);
        setProductos([]);
      });
  };

  useEffect(() => {
    cargarProductos();
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  // Removemos el return null para no autenticados

  const productosFiltrados = productos.filter((p: any) => {
    const texto = ((p.nombre || p.titulo || "") + " " + (p.descripcion || "")).toString().toLowerCase();
    return texto.includes(busqueda.toLowerCase()) && (categoria === "" || p.categoria === categoria);
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
          Catálogo de Productos
        </h1>
        <p className="text-slate-400 text-lg mb-8">{productos.length} productos disponibles</p>

        <div className="flex gap-4 mb-8">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="flex-1 bg-slate-800 border-2 border-slate-700 text-slate-100 placeholder-slate-500 px-5 py-3.5 rounded-xl focus:outline-none focus:border-cyan-500 transition-all duration-300"
          />
          <select
            value={categoria}
            onChange={e => setCategoria(e.target.value)}
            className="bg-slate-800 border-2 border-slate-700 text-slate-100 px-5 py-3.5 rounded-xl focus:outline-none focus:border-cyan-500 transition-all duration-300"
          >
            <option value="">Todas las categorías</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-6">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productosFiltrados.map((producto: any) => (
              <ProductoCard 
                key={producto.id} 
                producto={producto} 
                onCartChange={() => setRefreshKey(prev => prev + 1)}
              />
            ))}
          </div>
          
          <div className="w-96 flex-shrink-0">
            <CartSidebar onCartChange={() => setRefreshKey(prev => prev + 1)} />
          </div>
        </div>
      </div>
    </div>
  );
}