import React, { useEffect, useState, useMemo } from "react";
import Topbar from "./components/topbar";
import ContactSection from "./components/contactsection";
import { parseVcf } from "./services/alumnos";
import { norm, includesContacto, cmpNombre } from "./utils/text";
import alumnosVcf from "./alumnos.vcf?raw"; // Importamos el VCF como texto

export default function App() {
  const [alumnos, setAlumnos] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    setAlumnos(parseVcf(alumnosVcf)); // Parseamos directamente el contenido del VCF
  }, []);

  const toggleFavorito = (id) => {
    setAlumnos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, favorito: !a.favorito } : a))
    );
  };

  const results = useMemo(() => {
    const normalizedQ = norm(q);
    const filtered = alumnos.filter((a) => includesContacto(a, normalizedQ));
    const favs = filtered
      .filter((f) => f.favorito)
      .sort((x, y) => cmpNombre(x.nombre, y.nombre));
    const others = filtered
      .filter((f) => !f.favorito)
      .sort((x, y) => cmpNombre(x.nombre, y.nombre));
    return { favs, others };
  }, [alumnos, q]);

  return (
    <div className="app">
      <Topbar value={q} onChange={setQ} />

      {results.favs.length === 0 && results.others.length === 0 ? (
        <p>No se encontraron alumnos para «{q}».</p>
      ) : (
        <>
          <ContactSection
            title="Favoritos"
            contacts={results.favs}
            onToggle={toggleFavorito}
          />
          <ContactSection
            title="Alumnos"
            contacts={results.others}
            onToggle={toggleFavorito}
          />
        </>
      )}
    </div>
  );
}
