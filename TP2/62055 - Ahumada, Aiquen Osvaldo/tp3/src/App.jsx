
import React, { useState } from "react"
import { loadAlumnos } from "./services/alumnos"
import { cmpNombre, includesContacto } from "./utils/text"
import Topbar from "./components/Topbar"
import ContactCard from "./components/ContactCard"
import ContactSection from "./components/ContactSection"
import './components/app.css';

function App() {
  const [search, setSearch] = useState("")
  const [alumnos, setAlumnos] = useState(loadAlumnos())

  function toggleFav(id) {
    setAlumnos(alumnos.map(a =>
      a.id === id ? { ...a, favorito: !a.favorito } : a
    ))
  }

  const filtrados = alumnos.filter(a => includesContacto(a, search))
  const favoritos = filtrados.filter(a => a.favorito).sort(cmpNombre)
  const otros = filtrados.filter(a => !a.favorito).sort(cmpNombre)

  return (
    <div className="app-container">
      <h1>Alumnos Programación 4</h1>
      <Topbar search={search} setSearch={setSearch} />
      <div className="section-title">Favoritos ({favoritos.length})</div>
      <ContactSection
        title="Favoritos"
        contacts={favoritos}
        onToggleFav={toggleFav}
      />
      <div className="section-title">Contactos ({otros.length})</div>
      <ContactSection
        title="Contactos"
        contacts={otros}
        onToggleFav={toggleFav}
      />
    </div>
  )

}

export default App
