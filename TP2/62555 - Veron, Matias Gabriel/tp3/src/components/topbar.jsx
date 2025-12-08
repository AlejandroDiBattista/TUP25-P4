import React from 'react'

export default function Topbar({ search, setSearch }) {
  return (
    <div className="top-bar">
      <h1>Alumnos Programación 4</h1>
      <input
        type="text"
        className="search-input"
        placeholder="Buscar por nombre, teléfono o legajo"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Buscar contactos"
      />
    </div>
  )
}
