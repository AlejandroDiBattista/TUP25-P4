import React from 'react';

/**
 * Componente Topbar - Barra superior con título y campo de búsqueda
 */

/**
 * Barra superior de la aplicación que contiene el título y el campo de búsqueda
 * @param {Object} props - Las propiedades del componente
 * @param {string} props.terminoBusqueda - El término actual de búsqueda
 * @param {Function} props.onBusquedaChange - Función que se ejecuta cuando cambia el término de búsqueda
 * @returns {JSX.Element} El componente Topbar renderizado
 */
function Topbar({ terminoBusqueda, onBusquedaChange }) {
  /**
   * Maneja el cambio en el campo de búsqueda
   * @param {Event} event - El evento de cambio del input
   */
  const handleInputChange = (event) => {
    // Obtenemos el valor del input y lo pasamos a la función padre
    const nuevoTermino = event.target.value;
    onBusquedaChange(nuevoTermino);
  };

  return (
    <div className="topbar">
      {/* Título principal de la aplicación */}
      <h1 className="topbar__titulo">Directorio de Alumnos</h1>
      
      {/* Campo de búsqueda */}
      <div className="topbar__busqueda">
        <input
          type="text"
          placeholder="Buscar por nombre, teléfono o legajo..."
          value={terminoBusqueda}
          onChange={handleInputChange}
          className="topbar__input"
        />
      </div>
    </div>
  );
}

export default Topbar;