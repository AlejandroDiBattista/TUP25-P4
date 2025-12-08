import React from 'react';

/**
 * Componente de barra superior con título y campo de búsqueda
 */
function Topbar({ busqueda, onBusquedaChange, totalContactos, contactosFiltrados }) {
  return (
    <header className="topbar">
      <div className="topbar-content">
        <h1 className="app-title">📚 Directorio de Alumnos</h1>
        
        <div className="search-container">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por nombre, teléfono o legajo..."
              value={busqueda}
              onChange={(e) => onBusquedaChange(e.target.value)}
            />
            {busqueda && (
              <button 
                className="clear-search"
                onClick={() => onBusquedaChange('')}
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>
          
          <div className="search-stats">
            {busqueda ? (
              <span>{contactosFiltrados} de {totalContactos} alumnos</span>
            ) : (
              <span>{totalContactos} alumnos total</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;