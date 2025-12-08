import React from 'react';
export default function ContactCard({ alumno, onToggleFavorito }) {
  const avatar = alumno.github
    ? `https://github.com/${alumno.github}.png?size=100`
    : null;
  const iniciales = alumno.nombre
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase();

  return (
    <div className="contact-card">
      <div className="avatar">
        {avatar ? (
          <img src={avatar} alt={alumno.nombre} />
        ) : (
          <span className="avatar-text">{iniciales}</span>
        )}
      </div>
      <div className="info">
        <strong>{alumno.nombre}</strong>
        <div>📞 {alumno.telefono}</div>
        <div>Legajo: {alumno.legajo}</div>
        {alumno.github && (
          <div>
            <a href={`https://github.com/${alumno.github}`} target="_blank" rel="noopener noreferrer">
              @{alumno.github}
            </a>
          </div>
        )}
      </div>
      <button
        className={`fav-btn${alumno.favorito ? ' fav' : ''}`}
        onClick={() => onToggleFavorito(alumno.id)}
        title={alumno.favorito ? 'Quitar de favoritos' : 'Marcar como favorito'}
        type="button"
      >
        ★
      </button>
    </div>
  );
}