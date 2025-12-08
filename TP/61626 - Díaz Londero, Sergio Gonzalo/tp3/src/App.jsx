

import React, { useEffect, useState } from "react";
import "./App.css";
import { loadAlumnos } from "./services/alumnos";
import norm, { cmpNombre, includesContacto } from "./utils/text";
import Topbar from "./components/Topbar";
import ContactSection from "./components/ContactSection";

function App() {
  const [alumnos, setAlumnos] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    loadAlumnos().then(setAlumnos);
  }, []);

  // Filtrar y agrupar
  const filtrados = alumnos.filter(a => includesContacto(a, busqueda));
  const favoritos = filtrados.filter(a => a.favorito).sort((a, b) => cmpNombre(a.nombre, b.nombre));
  const noFavoritos = filtrados.filter(a => !a.favorito).sort((a, b) => cmpNombre(a.nombre, b.nombre));

  function toggleFav(id) {
    setAlumnos(alumnos => alumnos.map(a => a.id === id ? { ...a, favorito: !a.favorito } : a));
  }

  return (
    <div className="app-container">
      <Topbar value={busqueda} onChange={setBusqueda} />
      <ContactSection title="Favoritos" contacts={favoritos} onToggleFav={toggleFav} />
      <ContactSection title="Otros" contacts={noFavoritos} onToggleFav={toggleFav} />
    </div>
  );
}

export default App
