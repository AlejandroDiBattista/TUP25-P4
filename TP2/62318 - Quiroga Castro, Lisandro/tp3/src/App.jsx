// src/App.jsx
import React, { useEffect, useState, useMemo } from "react";
import Topbar from "./components/Topbar";
import ContactSection from "./components/ContactSection";
import { loadAlumnos } from "./services/alumnos";
import { cmpNombre, includesContacto } from "./utils/text";

export default function App() {
  const [alumnos, setAlumnos] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    loadAlumnos()
      .then((data) => {
        if (!mounted) return;
        setAlumnos(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  function toggleFavorito(id) {
    setAlumnos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, favorito: !a.favorito } : a))
    );
  }

  const { favoritos, otros } = useMemo(() => {
    const visibles = alumnos.filter((a) => includesContacto(a, search));
    const fav = visibles
      .filter((a) => a.favorito)
      .slice()
      .sort(cmpNombre);
    const notFav = visibles
      .filter((a) => !a.favorito)
      .slice()
      .sort(cmpNombre);
    return { favoritos: fav, otros: notFav };
  }, [alumnos, search]);

  return (
    <div className="app">
      <Topbar value={search} onChange={setSearch} />

      <div className="sections">
        {loading ? <div className="empty">Cargando alumnos...</div> : null}

        <ContactSection
          title={`Favoritos (${favoritos.length})`}
          contactos={favoritos}
          onToggleFavorito={toggleFavorito}
        />
        <ContactSection
          title={`Contactos (${otros.length})`}
          contactos={otros}
          onToggleFavorito={toggleFavorito}
        />
      </div>
    </div>
  );
}
