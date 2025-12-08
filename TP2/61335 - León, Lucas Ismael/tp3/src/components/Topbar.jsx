import React from "react";

export default function Topbar({ query, setQuery }) {
  return (
    <header className="topbar">
      <h2>Directorio de Alumnos</h2>
      <input
        type="search"
        placeholder="Buscar por nombre, teléfono o legajo"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </header>
  );
}
