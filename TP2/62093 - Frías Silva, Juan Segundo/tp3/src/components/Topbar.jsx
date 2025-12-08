import React from "react";

export default function Topbar({ search, setSearch }) {
  return (
    <header className="topbar">
      <h1>Directorio de Alumnos</h1>
      <input
        type="text"
        placeholder="Buscar por nombre, teléfono o legajo..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </header>
  );
}