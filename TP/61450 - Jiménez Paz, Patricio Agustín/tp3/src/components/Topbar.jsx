import React from 'react'

export default function Topbar({ query, onChange }) {
  return (
    <header className="topbar">
      <h1>Alumnos Programación IV</h1>
      <input
        placeholder="Buscar por nombre, teléfono o legajo"
        value={query}
        onChange={e => onChange(e.target.value)}
        className="search"
      />
    </header>
  )
}
