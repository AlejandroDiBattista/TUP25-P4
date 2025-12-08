import React from "react";
import "../stylecomponents/Topbar.css";
function Topbar({ busqueda, setBusqueda }) {
  return (
    <header className="topbar">
      <h1>Directorio Alumnos</h1>
      <input
        className="topbar__input"
        type="search"
        placeholder="Buscar Por Nombre,Telefono o Legajo..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
      />
    </header>
  );
}

export default Topbar;