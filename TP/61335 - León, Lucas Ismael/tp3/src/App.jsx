import React from "react";
import { useEffect, useState } from "react";
import { loadAlumnos } from "./services/alumnos";
import { cmpNombre, includesContacto } from "./utils/text";
import Topbar from "./components/Topbar";
import ContactSection from "./components/ContactSection";

export default function App() {
  const [alumnos, setAlumnos] = useState([]);
  const [query, setQuery] = useState("");

  // Carga inicial de alumnos desde public/alumnos.vcf
  useEffect(() => {
    loadAlumnos().then(setAlumnos);
  }, []);

  function toggleFavorito(id) {
    setAlumnos((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, favorito: !a.favorito } : a
      )
    );
  }

  const filtrados = alumnos.filter((a) =>
    query ? includesContacto(a, query) : true
  );

  const favoritos = filtrados.filter((a) => a.favorito).sort(cmpNombre);
  const otros = filtrados.filter((a) => !a.favorito).sort(cmpNombre);

  return (
    <div className="container">
      <Topbar query={query} setQuery={setQuery} />
      {filtrados.length === 0 ? (
        <p>No se encontraron alumnos.</p>
      ) : (
        <>
          <ContactSection
            title="Favoritos"
            contacts={favoritos}
            toggleFavorito={toggleFavorito}
          />
          <ContactSection
            title="Contactos"
            contacts={otros}
            toggleFavorito={toggleFavorito}
          />
        </>
      )}
    </div>
  );
}
