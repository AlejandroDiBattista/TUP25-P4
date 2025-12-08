
import React from 'react';

export default function ContactCard({ alumno, toggleFavorito }) {
  const avatarUrl = alumno.github ? `https://github.com/${alumno.github}.png?size=100` : '';

  const avatarContent = avatarUrl ? (
    <img src={avatarUrl} alt={alumno.nombre} />
  ) : (
    <div className="avatar-placeholder">
      {alumno.nombre.split(' ').map(n => n[0]).join('').toUpperCase()}
    </div>
  );

  return (
    <div className="contact-card">
      {avatarContent}
      <div className="contact-info">
        <strong>{alumno.nombre}</strong>
        <div><b>Tel:</b> {alumno.telefono}</div>
        <div><b>Legajo:</b> {alumno.legajo}</div>
      </div>
      <div className="favorito" onClick={() => toggleFavorito(alumno.id)}>
        {alumno.favorito ? '⭐' : '☆'}
      </div>
    </div>
  );
}
