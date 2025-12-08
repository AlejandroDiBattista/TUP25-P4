import React from 'react'

export default function Topbar({ query, onQueryChange }) {
  return (
    <header className="topbar">
      <div className="topbar-inner container">
        <h1 className="title">Alumnos Programación 4</h1>
        <input
          className="search"
          placeholder="Buscar por nombre, teléfono o legajo"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
        />
      </div>
    </header>
  )
}