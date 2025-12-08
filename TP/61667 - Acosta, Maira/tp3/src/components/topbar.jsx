import React from "react";

export default function topbar({ value, onChange }) {
  return (
    <header className="topbar">
      <h1>Directorio de Alumnos</h1>
      <input
        type="text"
        placeholder="Buscar por nombre, teléfono o legajo..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </header>
  )
}
