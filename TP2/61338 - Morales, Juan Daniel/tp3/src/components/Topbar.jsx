import React from "react";

export default function Topbar({ query, setQuery }) {
  return (
    <header className="header container">
      <h1 className="title">Alumnos Programación 4</h1>
      <div className="search" role="search">
        <ion-icon name="search-outline" aria-hidden="true"></ion-icon>
        <input
          type="search"
          placeholder="Buscar por nombre, teléfono o legajo"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar alumnos"
        />
      </div>
    </header>
  );
}
