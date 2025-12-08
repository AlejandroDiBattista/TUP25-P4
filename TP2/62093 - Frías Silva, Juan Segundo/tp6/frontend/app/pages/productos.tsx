import React, { useState, useEffect } from "react";
import { fetchWithAuth, isAuthenticated } from "../services/auth";

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  existencia: number;
}

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoria, setCategoria] = useState("");
  const [buscar, setBuscar] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoria) params.append("categoria", categoria);
      if (buscar) params.append("buscar", buscar);

      const response = await fetch(`/api/productos?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Error al obtener los productos");
      }

      const data = await response.json();
      setProductos(data);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const agregarAlCarrito = async (productoId: number) => {
    if (!isAuthenticated()) {
      alert("Debes iniciar sesión para agregar productos al carrito.");
      return;
    }

    try {
      await fetchWithAuth("/api/carrito", {
        method: "POST",
        body: JSON.stringify({ producto_id: productoId, cantidad: 1 }),
        headers: { "Content-Type": "application/json" },
      });
      alert("Producto agregado al carrito.");
    } catch (error) {
      alert((error as Error).message);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, [categoria, buscar]);

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Catálogo de Productos</h1>
      {error && <p className="text-red-500">{error}</p>}
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        />
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Todas las categorías</option>
          <option value="Electrónica">Electrónica</option>
          <option value="Ropa de hombre">Ropa de hombre</option>
          <option value="Ropa de mujer">Ropa de mujer</option>
          <option value="Joyería">Joyería</option>
        </select>
        <button
          onClick={fetchProductos}
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Buscar
        </button>
      </div>
      {loading ? (
        <p className="text-center text-gray-500">Cargando productos...</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productos.map((producto) => (
            <li key={producto.id} className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-bold">{producto.nombre}</h2>
              <p className="text-gray-600">{producto.descripcion}</p>
              <p className="text-blue-500 font-bold">${producto.precio}</p>
              <p className="text-sm text-gray-500">Categoría: {producto.categoria}</p>
              <p className="text-sm text-gray-500">Stock: {producto.existencia}</p>
              <button
                onClick={() => agregarAlCarrito(producto.id)}
                className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Agregar al Carrito
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
