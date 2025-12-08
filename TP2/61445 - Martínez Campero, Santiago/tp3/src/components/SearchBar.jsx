import React from 'react';
import { debounce } from '../utils/text.js';

const SearchBar = ({ totalAlumnos, alumnosFiltrados, onBusqueda }) => {
  const manejarBusqueda = debounce((termino) => {
    onBusqueda(termino);
  }, 300);

  return (
    <div style={{ marginTop: '20px' }}>
      <input
        type="text"
        placeholder="🔍 Buscar por nombre, teléfono o legajo..."
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '12px',
          border: '2px solid #ddd',
          borderRadius: '8px',
          fontSize: '16px'
        }}
        onChange={(e) => manejarBusqueda(e.target.value)}
      />
      <p style={{ 
        textAlign: 'center', 
        marginTop: '10px', 
        color: '#666',
        fontSize: '14px'
      }}>
        {alumnosFiltrados === totalAlumnos ? 
          `Mostrando ${totalAlumnos} alumnos` : 
          `Encontrados ${alumnosFiltrados} de ${totalAlumnos}`
        }
      </p>
    </div>
  );
};

export default SearchBar;