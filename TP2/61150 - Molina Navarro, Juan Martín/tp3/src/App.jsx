
import React, { useEffect, useMemo, useState } from 'react'
import { loadAlumnos } from './services/alumnos.js'
import { cmpNombre, includesContacto } from './utils/text.js'

function Topbar({ value, onChange }) {
  return (
    <header className="topbar">
      <h1 className="title">Alumnos Programación 4</h1>
      <input
        className="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar por nombre, teléfono o legajo"
      />
    </header>
  )
}

function Avatar({ nombre, github }) {
  if (github) {
    const src = `https://github.com/${github}.png?size=100`
    return <img className="avatar" alt={nombre} src={src} />
  }
  const initials = nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('')
  return <div className="avatar placeholder">{initials || '?'}</div>
}

function Favorite({ active, onToggle }) {
  return (
    <button className={`fav ${active ? 'active' : ''}`} onClick={onToggle} aria-label="Favorito">
      ★
    </button>
  )
}

function ContactCard({ c, onToggleFav }) {
  return (
    <div className="card">
      <div className="card-head">
        <Avatar nombre={c.nombre} github={c.github} />
        <h3 className="card-title">{c.nombre}</h3>
        <Favorite active={c.favorito} onToggle={() => onToggleFav(c.id)} />
      </div>
      <div className="card-body">
        <div><strong>Tel:</strong> {c.telefono || '-'}</div>
        <div><strong>Legajo:</strong> {c.legajo}</div>
      </div>
    </div>
  )
}

function ContactSection({ title, contacts, onToggleFav }) {
  if (!contacts.length) return null
  return (
    <section className="section">
      <h2 className="section-title">
        {title} <span className="count">({contacts.length})</span>
      </h2>
      <div className="grid">
        {contacts.map((c) => (
          <ContactCard key={c.id} c={c} onToggleFav={onToggleFav} />
        ))}
      </div>
    </section>
  )
}

export default function App() {
  const [alumnos, setAlumnos] = useState([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    loadAlumnos().then(setAlumnos).catch((e) => {
      console.error('Error cargando alumnos:', e)
    })
  }, [])

  const onToggleFav = (id) => {
    setAlumnos((prev) => prev.map((a) => (a.id === id ? { ...a, favorito: !a.favorito } : a)))
  }

  const filtrados = useMemo(() => {
    const q = query.trim()
    const arr = q ? alumnos.filter((c) => includesContacto(c, q)) : alumnos.slice()
    return arr.sort(cmpNombre)
  }, [alumnos, query])

  const favoritos = filtrados.filter((c) => c.favorito)
  const restantes = filtrados.filter((c) => !c.favorito)

  const vacio = !favoritos.length && !restantes.length

  return (
    <div className="app">
      <Topbar value={query} onChange={setQuery} />

      {vacio ? (
        <p className="empty">No se encontraron contactos.</p>
      ) : (
        <>
          <ContactSection title="Favoritos" contacts={favoritos} onToggleFav={onToggleFav} />
          <ContactSection title="Contactos" contacts={restantes} onToggleFav={onToggleFav} />
        </>
      )}
    </div>
  )
}
