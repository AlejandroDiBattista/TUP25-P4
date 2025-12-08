import React, { useState } from 'react'
import { loadAlumnos } from './services/alumnos'
import { cmpNombre, includesContacto } from './utils/text'
import Topbar from './components/topbar'
import ContactSection from './components/ContactSection'
import './index.css'

export default function App() {
  const [alumnos, setAlumnos] = useState(loadAlumnos())
  const [search, setSearch] = useState('')

  const toggleFavorito = (id) => {
    setAlumnos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, favorito: !a.favorito } : a))
    )
  }

  const filtrados = alumnos.filter((a) => includesContacto(a, search))
  const favoritos = filtrados.filter((a) => a.favorito).sort(cmpNombre)
  const normales = filtrados.filter((a) => !a.favorito).sort(cmpNombre)

  return (
    <div className="app">
      <Topbar search={search} setSearch={setSearch} />

      {filtrados.length === 0 ? (
        <p className="empty">No se encontraron resultados.</p>
      ) : (
        <>
          <ContactSection
            title="Favoritos"
            contacts={favoritos}
            toggleFavorito={toggleFavorito}
          />
          <ContactSection
            title="Contactos"
            contacts={normales}
            toggleFavorito={toggleFavorito}
          />
        </>
      )}
    </div>
  )
}
