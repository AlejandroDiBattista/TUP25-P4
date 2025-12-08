"use client";
import { useState, useEffect } from "react";
import { obtenerProductos } from "./services/productos";
import SearchBar from "./components/SearchBar";
import CategorySelect from "./components/CategorySelect";
import ProductoRow from "./components/ProductoRow";
import { Producto } from "./types";
import CartSidebar from "./components/CartSidebar";

export default function Home() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("");
  const [categorias, setCategorias] = useState<string[]>([]);
  const [addedMsg, setAddedMsg] = useState<string | null>(null);
  const [needLoginMsg, setNeedLoginMsg] = useState<string | null>(null);
  const [isLogged, setIsLogged] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("token");
    }
    return false;
  });

  useEffect(() => {
    obtenerProductos().then((data: Producto[]) => {
      setProductos(data);
      const cats = Array.from(new Set(data.map((p) => p.categoria).filter(Boolean)));
      setCategorias(cats);
    });
    if (typeof window !== "undefined") {
      const handler = () => setIsLogged(!!localStorage.getItem("token"));
      window.addEventListener("storage", handler);
      return () => window.removeEventListener("storage", handler);
    }
  }, []);

  const onAddToCart = async (id: number) => {
    if (typeof window === "undefined") return;
    if (!isLogged) {
      setNeedLoginMsg("Inicia sesión para agregar productos");
      setTimeout(() => setNeedLoginMsg(null), 1800);
      return;
    }
    // Llamar backend y luego espejar en localStorage
    const token = localStorage.getItem("token");
    let ok = true;
    if (token) {
      try {
        const resp = await fetch("http://localhost:8000/carrito", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ producto_id: id, cantidad: 1 }),
        });
        ok = resp.ok;
      } catch {}
    }
    if (ok) {
      const carritoRaw = localStorage.getItem("carrito");
      const carrito: { id: number; cantidad: number }[] = carritoRaw ? JSON.parse(carritoRaw) : [];
      const existing = carrito.find((item) => item.id === id);
      if (existing) existing.cantidad += 1; else carrito.push({ id, cantidad: 1 });
      localStorage.setItem("carrito", JSON.stringify(carrito));
      window.dispatchEvent(new Event("carrito:changed"));
      setAddedMsg("Producto agregado al carrito");
      setTimeout(() => setAddedMsg(null), 1500);
    } else {
      setAddedMsg("No hay stock suficiente");
      setTimeout(() => setAddedMsg(null), 1500);
    }
  };

  const productosFiltrados = productos.filter((producto) => {
    const coincideBusqueda =
      producto.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoria ? producto.categoria === categoria : true;
    return coincideBusqueda && coincideCategoria;
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mt-10">
          <h1 className="text-2xl font-bold mb-6">Productos</h1>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <SearchBar value={busqueda} onChange={setBusqueda} />
            </div>
            <CategorySelect value={categoria} onChange={setCategoria} categories={categorias} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">
            <div className="space-y-4">
              {productosFiltrados.map((producto: Producto) => (
                <ProductoRow key={producto.id} producto={producto} onAdd={onAddToCart} isLogged={isLogged} />
              ))}
            </div>
            <CartSidebar />
          </div>
        </div>
      </div>
      {addedMsg && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded shadow-lg text-sm">
          {addedMsg}
        </div>
      )}
      {needLoginMsg && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded shadow-lg text-sm">
          {needLoginMsg}
        </div>
      )}
    </div>
  );
}
