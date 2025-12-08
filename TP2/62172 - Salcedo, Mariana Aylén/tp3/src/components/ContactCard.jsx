import React from 'react';

export default function ContactCard({ alumno, onToggleFav }) {
  const { nombre, telefono, legajo, github, favorito } = alumno;
  const avatarUrl = github ? `https://github.com/${github}.png?size=100` : null;
  const iniciales = nombre
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase();

  return (
    <div className="contact-card">
      {avatarUrl ? (
        <img src={avatarUrl} alt={github} className="avatar" />
      ) : (
        <div className="avatar-alt">{iniciales}</div>
      )}
      <div className="info">
        <div className="nombre">{nombre}</div>
        <div className="telefono">{telefono}</div>
        <div className="legajo">Legajo: {legajo}</div>
      </div>
      <button
        className={favorito ? 'fav active' : 'fav'}
        onClick={() => onToggleFav(alumno.id)}
        title={favorito ? 'Quitar de favoritos' : 'Marcar como favorito'}
      >
        ★
      </button>
    </div>
  );
}
