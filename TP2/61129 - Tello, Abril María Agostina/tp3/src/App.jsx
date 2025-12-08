
import React, { useEffect, useState, useMemo } from "react";
import { loadAlumnos } from "./services/alumnos";
import { norm, cmpNombre, includesContacto } from "./utils/text";
import Topbar from "./components/Topbar";
import ContactSection from "./components/ContactSection";

export default function App() {
  const [alumnos, setAlumnos] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    loadAlumnos().then(setAlumnos);
  }, []);

  // Alternar favorito en memoria
  const toggleFav = id => {
    setAlumnos(alumnos => alumnos.map(a => a.id === id ? { ...a, favorito: !a.favorito } : a));
  };

  // Filtrar y agrupar
  const { favoritos, otros } = useMemo(() => {
    const filtrados = alumnos.filter(a => includesContacto(a, busqueda));
    const favoritos = filtrados.filter(a => a.favorito).sort((a, b) => cmpNombre(a.nombre, b.nombre));
    const otros = filtrados.filter(a => !a.favorito).sort((a, b) => cmpNombre(a.nombre, b.nombre));
    return { favoritos, otros };
  }, [alumnos, busqueda]);

  const hayResultados = favoritos.length > 0 || otros.length > 0;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#f4f6fa", minHeight: "100vh" }}>
      <Topbar value={busqueda} onChange={setBusqueda} />
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 24px 48px 24px" }}>
        {hayResultados ? (
          <>
            <ContactSection title="Favoritos" contacts={favoritos} onToggleFav={toggleFav} />
            <ContactSection title="Contactos" contacts={otros} onToggleFav={toggleFav} />
          </>
        ) : (
          <div style={{ marginTop: 64, textAlign: "center", color: "#888", fontSize: 22 }}>
            No se encontraron alumnos para la búsqueda.
          </div>
        )}
      </main>
    </div>
  );
}
