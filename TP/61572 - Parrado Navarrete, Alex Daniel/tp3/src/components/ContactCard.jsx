import React from 'react';

function getInitials(nombre) {
  return nombre
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

export default function ContactCard({ alumno, onToggleFavorito }) {
  return (
    <div className="contact-card">
      {alumno.github ? (
        <img
          src={`https://github.com/${alumno.github}.png?size=100`}
          alt={alumno.nombre}
          className="avatar"
        />
      ) : (
        <div className="avatar avatar-text">{getInitials(alumno.nombre)}</div>
      )}
      <div className="info">
        <div className="nombre">{alumno.nombre}</div>
        <div className="telefono">📱 {alumno.telefono}</div>
        <div className="legajo">Legajo: {alumno.legajo}</div>
        {alumno.github && (
          <div className="github">
            <a href={`https://github.com/${alumno.github}`} target="_blank" rel="noopener noreferrer">
              @{alumno.github}
            </a>
          </div>
        )}
      </div>
      <button
        className={`favorito ${alumno.favorito ? 'activo' : ''}`}
        onClick={onToggleFavorito}
        title={alumno.favorito ? 'Quitar de favoritos' : 'Marcar como favorito'}
      >
        ★
      </button>
    </div>
  );
}
