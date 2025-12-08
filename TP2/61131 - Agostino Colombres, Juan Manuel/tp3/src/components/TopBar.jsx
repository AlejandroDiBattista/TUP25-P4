import React from "react";
import "../Style.css";

export default function Topbar({ search, setSearch }) {
  return (
    <header className="topbar">
      <h1 className="topbar-title">Directorio de Alumnos</h1>
      <input
        type="text"
        placeholder="Buscar por nombre, teléfono o legajo..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="topbar-input"
      />
    </header>
  );
}