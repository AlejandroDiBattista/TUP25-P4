import React from 'react';

export default function Topbar({ value, onChange }) {
  return (
    <header className="topbar">
      <h1 className="app-title">Directorio de Alumnos</h1>
      <input
        type="text"
        className="search-input"
        aria-label="Buscar"
        placeholder="Buscar por nombre, teléfono o legajo..."
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </header>
  );
}