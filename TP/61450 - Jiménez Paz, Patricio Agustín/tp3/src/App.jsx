
import React, { useEffect, useState } from 'react'
import { loadAlumnos } from './services/alumnos'
import { includesContacto, cmpNombre } from './utils/text'
import Topbar from './components/Topbar'
import ContactSection from './components/ContactSection'
import './App.css'

function App() {
  const [alumnos, setAlumnos] = useState([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    let mounted = true
    loadAlumnos().then(data => {
      if (!mounted) return
      setAlumnos(data)
    })
    return () => (mounted = false)
  }, [])

  function toggleFav(id) {
    setAlumnos(prev => prev.map(a => (a.id === id ? { ...a, favorito: !a.favorito } : a)))
  }

  const filtered = alumnos.filter(a => includesContacto(a, query))

  const favs = filtered.filter(a => a.favorito).sort(cmpNombre)
  const others = filtered.filter(a => !a.favorito).sort(cmpNombre)

  return (
    <div className='app-container'>
      <Topbar query={query} onChange={setQuery} />
      <main>
        <ContactSection title="Favoritos" contacts={favs} onToggleFav={toggleFav} />
        <ContactSection title="Todos" contacts={others} onToggleFav={toggleFav} />
      </main>
    </div>
  )
}

export default App
