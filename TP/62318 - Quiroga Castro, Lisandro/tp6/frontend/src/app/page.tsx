"use client";

import { useEffect, useState } from "react";
import ProductoCard from "../components/ProductoCard";
import { obtenerProductos } from "../services/productos";

export default function Home() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");

  useEffect(() => {
    obtenerProductos().then(setProductos);
  }, []);

  const categorias = [
    "Todas",
    "Ropa de hombre",
    "Joyería",
    "Electrónica",
    "Ropa de mujer",
  ];

  const filtrados = productos.filter((p: any) => {
    const coincideBusqueda = p.titulo
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    const coincideCategoria =
      categoria === "Todas" || p.categoria === categoria;

    return coincideBusqueda && coincideCategoria;
  });

  return (
    <div style={{ padding: 20 }}>
      <h1>Productos</h1>

      <div style={{ marginBottom: 20, display: "flex", gap: 20 }}>
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            padding: 8,
            border: "1px solid #ccc",
            borderRadius: 5,
            flex: 1,
          }}
        />

        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          style={{
            padding: 8,
            border: "1px solid #ccc",
            borderRadius: 5,
          }}
        >
          {categorias.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        {filtrados.map((p: any) => (
          <ProductoCard key={p.id} producto={p} />
        ))}
      </div>
    </div>
  );
}
//
