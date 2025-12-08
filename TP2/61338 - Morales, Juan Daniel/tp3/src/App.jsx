import React from "react";
import { useEffect, useMemo, useState } from "react";
import Topbar from "./components/Topbar.jsx";
import ContactSection from "./components/ContactSection.jsx";
import { loadAlumnos } from "./services/alumnos.js";
import { cmpNombre, includesContacto } from "./utils/text.js";
import "./styles.css";

export default function App() {
  const [all, setAll] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    loadAlumnos().then(setAll).catch(() => setAll([]));
  }, []);

  const filtered  = useMemo(() => all.filter(c => includesContacto(c, query)), [all, query]);
  const favoritos = useMemo(() => filtered.filter(c => c.favorito).sort(cmpNombre), [filtered]);
  const comunes   = useMemo(() => filtered.filter(c => !c.favorito).sort(cmpNombre), [filtered]);

  function toggleFav(id) {
    setAll(prev => prev.map(c => (c.id === id ? { ...c, favorito: !c.favorito } : c)));
  }

  return (
    <>
      <Topbar query={query} setQuery={setQuery} />
      {filtered.length === 0 ? (
        <div className="empty container">No hay resultados que coincidan con “{query}”.</div>
      ) : (
        <>
          <ContactSection title="Favoritos" contacts={favoritos} onToggleFav={toggleFav} />
          {/* <div className="hr container" /> */}
          <ContactSection title="Contactos" contacts={comunes} onToggleFav={toggleFav} />
        </>
      )}
    </>
  );
}
