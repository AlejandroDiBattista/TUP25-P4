import React from 'react';

export default function Topbar({ busqueda, setBusqueda }) {
  return (
    <header>
      <h1>Alumnos Programación 4</h1>
      <label htmlFor="busqueda" style={{ display: 'none' }}>Buscar</label>
      <input
        id="busqueda"
        type="search"
        placeholder="Buscar por nombre, teléfono o legajo..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
      />
    </header>
  );
}