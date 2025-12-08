import React from 'react';
import { getIniciales } from '../utils/text.js';

const ContactCard = ({ alumno, onToggleFavorito }) => {
  return (
    <div style={{
      backgroundColor: alumno.esFavorito ? '#fff3cd' : 'white',
      border: alumno.esFavorito ? '2px solid #f59e0b' : '1px solid #ddd',
      borderRadius: '8px',
      padding: '15px',
      position: 'relative',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <button
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'none',
          border: 'none',
          fontSize: '20px',
          cursor: 'pointer'
        }}
        onClick={() => onToggleFavorito(alumno.legajo)}
        title={alumno.esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        {alumno.esFavorito ? '⭐' : '☆'}
      </button>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: '#007bff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          overflow: 'hidden'
        }}>
          {alumno.github ? (
            <img 
              src={`https://github.com/${alumno.github}.png?size=100`}
              alt={`Avatar de ${alumno.nombre}`}
              style={{ width: '100%', height: '100%', borderRadius: '50%' }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.textContent = getIniciales(alumno.nombre);
              }}
            />
          ) : (
            getIniciales(alumno.nombre)
          )}
        </div>
        
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>
            {alumno.nombre}
          </h3>
          <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
            📞 {alumno.telefono}
          </p>
          <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
            🎓 Legajo: {alumno.legajo}
          </p>
          {alumno.github && (
            <p style={{ margin: '4px 0', fontSize: '14px' }}>
              💻 <a 
                href={`https://github.com/${alumno.github}`} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#007bff', textDecoration: 'none' }}
              >
                {alumno.github}
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactCard;