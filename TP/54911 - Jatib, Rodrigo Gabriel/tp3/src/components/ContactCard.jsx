import React from 'react';
export default function ContactCard({ alumno, onToggle }) {
  const avatarUrl = alumno.github
    ? `https://github.com/${alumno.github}.png?size=100`
    : null;

  const iniciales = alumno.nombre
    ? alumno.nombre
        .split(' ')
        .map(p => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '--';

  return (
    <article>
      <figure>
        {avatarUrl ? (
          <img src={avatarUrl} alt={`Avatar de ${alumno.nombre}`} />
        ) : (
          <div className="iniciales">
            {iniciales}
          </div>
        )}
      </figure>
      <h3>{alumno.nombre}</h3>
      <p>📞 {alumno.telefono}</p>
      <p>🆔 Legajo: {alumno.legajo}</p>
      {alumno.github && <p>🐙 {alumno.github}</p>}
      <button onClick={() => onToggle(alumno.id)}>
        {alumno.favorito ? '★ Quitar' : '☆ Favorito'}
      </button>
    </article>
  );
}