import React from 'react';

function Topbar({ busqueda, setBusqueda }) {
  return (
    <div className="topbar">
      <h1>📚 Directorio de Alumnos</h1>
      <input
        type="text"
        placeholder="Buscar por nombre, teléfono o legajo..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="search-input"
      />
    </div>
  );
}

export default Topbar;