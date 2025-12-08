import React from "react"
import { useState } from "react";
import { loadAlumnos } from "./services/alumnos";
import { norm, cmpNombre, includesContacto } from "./utils/text";
import Topbar from "./components/Topbar";
import ContactSection from "./components/ContactSection";

function App() {
  const [alumnos, setAlumnos] = useState(loadAlumnos());
  const [busqueda, setBusqueda] = useState("");

  // Filtrado y agrupación
  const filtrados = alumnos.filter(a => includesContacto(a, busqueda));
  const favoritos = filtrados.filter(a => a.favorito).sort(cmpNombre);
  const noFavoritos = filtrados.filter(a => !a.favorito).sort(cmpNombre);

  // Toggle favorito
  const toggleFavorito = id => {
    setAlumnos(alumnos =>
      alumnos.map(a =>
        a.id === id ? { ...a, favorito: !a.favorito } : a
      )
    );
  };

  return (
    <>
      <Topbar busqueda={busqueda} setBusqueda={setBusqueda} />
      <ContactSection
        title="Favoritos"
        contacts={favoritos}
        toggleFavorito={toggleFavorito}
      />
      <ContactSection
        title="Alumnos"
        contacts={noFavoritos}
        toggleFavorito={toggleFavorito}
      />
      {filtrados.length === 0 && <p>No se encontraron alumnos.</p>}
    </>
  );
}

export default App;