import React, { useState, useMemo } from "react";
import { loadAlumnos } from "./services/alumnos";
import { cmpNombre, includesContacto } from "./utils/text";

import Topbar from "./components/Topbar";
import ContactSection from "./components/ContactSection";

export default function App() {
  // Estado inicial: alumnos desde el VCF
  const [alumnos, setAlumnos] = useState(loadAlumnos());
  const [search, setSearch] = useState("");

  // Alternar favorito
  const toggleFavorito = (legajo) => {
    setAlumnos((prev) =>
      prev.map((a) =>
        a.legajo === legajo ? { ...a, favorito: !a.favorito } : a
      )
    );
  };

  // Filtrar y ordenar
  const { favoritos, otros } = useMemo(() => {
    const filtrados = alumnos.filter((a) =>
      includesContacto(a, search)
    );

    const favs = filtrados.filter((a) => a.favorito).sort(cmpNombre);
    const rest = filtrados.filter((a) => !a.favorito).sort(cmpNombre);

    return { favoritos: favs, otros: rest };
  }, [alumnos, search]);

  return (
    <div className="app">
      <Topbar search={search} setSearch={setSearch} />

      <main>
        <ContactSection
          title="⭐ Favoritos"
          contacts={favoritos}
          onToggleFavorito={toggleFavorito}
        />

        <ContactSection
          title="👥 Alumnos"
          contacts={otros}
          onToggleFavorito={toggleFavorito}
        />
      </main>
    </div>
  );
}
