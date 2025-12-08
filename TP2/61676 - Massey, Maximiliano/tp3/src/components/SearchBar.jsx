import React, { useState } from 'react';

function SearchBar({ totalAlumnos, alumnosFiltrados, onBusqueda }) {
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  const handleBusqueda = (e) => {
    const valor = e.target.value;
    setTerminoBusqueda(valor);
    onBusqueda(valor);
  };

  return (
    <div className="search-container">
      <input
        type="text"
        className="search-input"
        placeholder="Buscar por nombre, teléfono o legajo..."
        value={terminoBusqueda}
        onChange={handleBusqueda}
      />
      
      {terminoBusqueda.trim() && (
        <div style={{ 
          textAlign: 'center', 
          marginTop: '10px', 
          fontSize: '0.9rem', 
          color: '#666' 
        }}>
          Mostrando {alumnosFiltrados} de {totalAlumnos} alumnos
        </div>
      )}
    </div>
  );
}

export default SearchBar;