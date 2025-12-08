import React from 'react';
import "../styles/BarraSuperior.css";

const BarraSuperior = ({ busqueda, setBusqueda }) => {
  return (
    <header className="barra-superior">
      <h1>Alumnos Programación 4</h1>
      <input
        type="text"
        placeholder="Buscar por nombre, teléfono o legajo"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="input-busqueda"
      />
    </header>
  );
};

export default BarraSuperior;