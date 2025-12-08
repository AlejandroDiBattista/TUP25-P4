import React from 'react'

export default function Topbar({ value, onChange }) {
  return (
    <header className="topbar">
      <h1>Directorio de Alumnos</h1>
      <input
        aria-label="Buscar contactos"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Buscar por nombre, teléfono o legajo..."
        className="search"
      />
    </header>
  )
}
