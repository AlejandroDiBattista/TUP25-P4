
import React from 'react';

export default function Topbar({ search, setSearch }) {
  return (
    <div className="topbar">
      <h1>Alumnos Programación 4</h1>
      <input
        type="text"
        placeholder="Buscar por nombre, teléfono o legajo"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
    </div>
  );
}
