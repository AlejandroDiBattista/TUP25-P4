import React, { useEffect, useMemo, useState } from 'react'
import { loadAlumnos } from './services/alumnos.js'
import { cmpNombre, includesContacto, norm } from './utils/text.js'

function Avatar({ nombre, github }) {
  if (github) {
    const src = `https://github.com/${github}.png?size=100`
    return <img src={src} alt={`Avatar de ${nombre}`} className="avatar" />
  }
  const initials = (nombre || '')
    .split(',')
    .join(' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(p => p[0]?.toUpperCase())
    .slice(0, 2)
    .join('')
  return <div className="avatar avatar--initials" aria-hidden>{initials}</div>
}

function Star({ active, onClick }) {
  return (
    <button className={`star ${active ? 'is-active' : ''}`} onClick={onClick} title={active ? 'Quitar de favoritos' : 'Agregar a favoritos'} aria-label="Favorito">
      ★
    </button>
  )
}

function ContactCard({ a, onToggleFav }) {
  return (
    <article className="card">
      <div className="card__header">
        <Avatar nombre={a.nombre} github={a.github} />
        <h3 className="card__title">{a.nombre}</h3>
        <Star active={a.favorito} onClick={() => onToggleFav(a.id)} />
      </div>
      <div className="card__body">
        <div className="field"><span className="label">Tel:</span> <span>{a.telefono || '-'}</span></div>
        <div className="field"><span className="label">Legajo:</span> <span>{a.legajo || '-'}</span></div>
      </div>
    </article>
  )
}

function ContactSection({ title, contacts, onToggleFav }) {
  if (!contacts.length) return null
  return (
    <section className="section">
      <h2 className="section__title">{title} <span className="muted">({contacts.length})</span></h2>
      <div className="grid">
        {contacts.map(a => (
          <ContactCard key={a.id} a={a} onToggleFav={onToggleFav} />
        ))}
      </div>
    </section>
  )
}

function Topbar({ query, setQuery }) {
  return (
    <header className="topbar">
      <h1>Alumnos Programación 4</h1>
      <input
        className="search"
        type="search"
        placeholder="Buscar por nombre, teléfono o legajo"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
    </header>
  )
}

export default function App() {
  const [alumnos, setAlumnos] = useState([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    loadAlumnos().then(setAlumnos)
  }, [])

  const filtered = useMemo(() => {
    const f = alumnos.filter(a => includesContacto(query, a))
    const favs = f.filter(a => a.favorito).sort(cmpNombre)
    const rest = f.filter(a => !a.favorito).sort(cmpNombre)
    return { favs, rest }
  }, [alumnos, query])

  function toggleFav(id) {
    setAlumnos(prev => prev.map(a => (a.id === id ? { ...a, favorito: !a.favorito } : a)))
  }

  return (
    <div className="app">
      <Topbar query={query} setQuery={setQuery} />

      {filtered.favs.length === 0 && filtered.rest.length === 0 ? (
        <p className="empty">No hay resultados para “{query}”.</p>
      ) : (
        <>
          <ContactSection title="Favoritos" contacts={filtered.favs} onToggleFav={toggleFav} />
          <ContactSection title="Contactos" contacts={filtered.rest} onToggleFav={toggleFav} />
        </>
      )}

      <style>{`
        :root { color-scheme: light; }
        .app { max-width: 1100px; margin: 0 auto; padding: 24px; font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans', 'Liberation Sans', 'Apple Color Emoji', 'Segoe UI Emoji'; }
        .topbar { display:flex; align-items:center; justify-content:space-between; gap: 16px; margin-bottom: 24px; }
        .topbar h1 { margin: 0; font-size: 28px; }
        .search { flex: 0 1 420px; height: 40px; border-radius: 24px; padding: 0 14px; border: 1px solid #e5e7eb; background: #f9fafb; }
        .section { margin-top: 16px; }
        .section__title { font-size: 20px; margin: 16px 8px; }
        .muted { color: #6b7280; font-weight: 500; }
        .grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
        .card { border: 1px solid #e5e7eb; border-radius: 12px; background: white; box-shadow: 0 8px 18px rgba(0,0,0,.05); overflow:hidden; }
        .card__header { display:flex; align-items:center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #eef2f7; }
        .card__title { margin:0; font-size: 18px; flex:1; }
        .card__body { padding: 12px 16px 16px; }
        .field { margin: 6px 0; }
        .label { font-weight: 700; color: #374151; margin-right: 6px; }
        .avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
        .avatar--initials {display:grid; place-items:center; background: #e5f0ff; color:#1f4ed8; font-weight:700; }
        .star { width: 32px; height: 32px; border-radius: 50%; border: 1px solid #e5e7eb; background: #fff; color: #f59e0b; cursor: pointer; }
        .star.is-active { color: #f59e0b; }
        .empty { padding: 32px; text-align: center; color: #6b7280; }
      `}</style>
    </div>
  )
}
