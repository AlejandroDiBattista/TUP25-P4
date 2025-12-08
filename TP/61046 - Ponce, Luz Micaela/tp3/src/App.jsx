import React from "react"
import { useState } from "react"
import { loadAlumnos } from "./services/alumnos"
import { cmpNombre, includesContacto } from "./utils/text"
import Topbar from "./components/Topbar"
import ContactSection from "./components/ContactSection"


function App() {

  const [search, setSearch] = useState("");
  const [alumnos, setAlumnos] = useState(loadAlumnos());

  const toggleFavorito = (id) => {
    setAlumnos(prev => prev.map(a =>
    a.id === id ? { ...a, favorito: !a.favorito } : a
    ));
  };

  const filtrados = alumnos
    .filter(a => includesContacto(a, search))
    .sort(cmpNombre);

  const favoritos = filtrados.filter(a => a.favorito);
  const otros = filtrados.filter(a => !a.favorito);

  return (
    <div>
      <Topbar search={search} setSearch={setSearch} />
      <ContactSection title="⭐ Favoritos" contacts={favoritos} toggleFavorito={toggleFavorito} />
      <ContactSection title="👥 Alumnos" contacts={otros} toggleFavorito={toggleFavorito} />
    </div>
  );
}

export default App;
