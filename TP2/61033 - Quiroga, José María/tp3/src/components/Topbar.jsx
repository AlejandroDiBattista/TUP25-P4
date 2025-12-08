import React from 'react';
export default function Topbar({ value, onChange }) {
  return (
    <header className="topbar">
      <h1>Directorio de Alumnos</h1>
      <input
        type="search"
        placeholder="Buscar por nombre, teléfono o legajo..."
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </header>
  );
}