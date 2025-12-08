import React, { useEffect, useState } from "react";
import { loadAlumnos } from "./services/alumnos";
import { includesContacto, cmpNombre } from "./utils/text";
import Topbar from "./components/Topbar";
import ContactSection from "./components/ContactSection";

export default function App() {
  const [alumnos, setAlumnos] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    // ✅ Leemos el archivo desde public con fetch
    fetch("/alumnos.vcf")
      .then((res) => res.text())
      .then((text) => {
        const parsed = loadAlumnos(text); // tu función que parsea
        setAlumnos(parsed);
      });
  }, []);

  // Filtran por búsqueda
  const filtrados = alumnos.filter((a) => includesContacto(a, query));

  // Separan favoritos y no favoritos
  const favoritos = filtrados
    .filter((a) => a.favorito)
    .sort((x, y) => cmpNombre(x, y));

  const otros = filtrados
    .filter((a) => !a.favorito)
    .sort((x, y) => cmpNombre(x, y));

  // Alternan favorito en memoria
  function toggleFavorito(id) {
    setAlumnos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, favorito: !a.favorito } : a))
    );
  }

  return (
    <div className="app">
      <Topbar query={query} onQueryChange={setQuery} />

      <div className="container">
        <ContactSection
          title={`Favoritos (${favoritos.length})`}
          contacts={favoritos}
          onToggleFavorite={toggleFavorito}
          emptyMessage="No hay favoritos"
        />
        <ContactSection
          title={`Otros (${otros.length})`}
          contacts={otros}
          onToggleFavorite={toggleFavorito}
          emptyMessage="No hay otros contactos"
        />
      </div>
    </div>
  );
}