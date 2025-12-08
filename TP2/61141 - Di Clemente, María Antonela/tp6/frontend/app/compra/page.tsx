"use client";

import { useRouter } from "next/navigation"; 
import { obtenerProductos } from '../services/productos';
import ProductoCard from '../components/ProductoCard';
import { useState, useEffect } from 'react';
import Carrito from '../components/Carrito';
import { Producto } from "../types";
import { useCarrito } from "../components/CarritoContext";


export default function Home() {
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas las categorias")
  const { agregarAlCarrito, cartItems: carrito } = useCarrito();

  useEffect(() => {
    const cargarProductos = async () => {
      const data = await obtenerProductos();
      setProductos(data);
    };
    cargarProductos();
  }, []);

  const productosFiltrados = productos.filter((p) => {
    const nombre = p?.titulo?.toLowerCase() || "";
    const coincideBusqueda = nombre.includes(busqueda.toLowerCase());
    const coincideCategoria = categoria === "Todas las categorias" || p.categoria === categoria;
    return coincideBusqueda && coincideCategoria;
  });

  const categorias = ["Todas las categorias", ...Array.from(new Set(productos.map((p) => p.categoria)))];

  const handleSalir = () => {
    localStorage.removeItem("usuario"); // o token si tenés login real
    localStorage.removeItem("token");
    router.push("/iniciar-sesion");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900 font-serif tracking-tight">TP6 Shop</h1>
          <nav className="flex items-center gap-5 ml-[-40px]"> 
            <button
              onClick={() => router.push("/")}
              className="text-gray-700 hover:text-blue-600"
            >
              Productos
            </button>

            <button
              onClick={() => router.push("/mis-compras")}
              className="text-gray-700 hover:text-blue-600"
            >
              Mis compras
            </button>

            <button
              onClick={handleSalir}
              className="text-red-600 hover:text-red-800 transition"
            >
              Salir
            </button>
          </nav>
        </div>
      </header>
      <section className="max-w-7xl mx-auto px-6 mt-6 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1 border rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="border rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categorias.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          {productosFiltrados.map((producto) => (
            <ProductoCard key={producto.id} producto={producto} onAgregar={agregarAlCarrito} />
          ))}
        </div>

        <aside className="hidden lg:block">
          <Carrito />
        </aside>
      </main>
    </div>
  );
}