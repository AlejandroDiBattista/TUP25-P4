import { useState } from "react";
import { loadAlumnos } from "./services/alumnos";
import { cmpNombre, includesContacto } from "./utils/text";
import Topbar from "./components/Topbar";
import ContactSection from "./components/ContactSection";

export default function App() {
  const [query, setQuery] = useState("");
  const [alumnos, setAlumnos] = useState(loadAlumnos());

  function toggleFavorito(id) {
    setAlumnos((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, favorito: !a.favorito } : a
      )
    );
  }

  const filtrados = alumnos.filter((a) => includesContacto(a, query));
  const favoritos = filtrados.filter((a) => a.favorito).sort(cmpNombre);
  const noFavoritos = filtrados.filter((a) => !a.favorito).sort(cmpNombre);

  return (
    <div>
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
            title="Otros alumnos"
            contacts={noFavoritos}
            toggleFavorito={toggleFavorito}
          />
        </>
      )}
    </div>
  );
}
