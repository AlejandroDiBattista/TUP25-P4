import React from 'react'; 

export default function ContactCard({ alumno, onToggleFavorito }) {
  const initials = alumno.nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase() || '')
    .join('');

  const avatarUrl = alumno.github
    ? `https://github.com/${alumno.github}.png?size=100`
    : null;

  return (
    <article className={`contact-card ${alumno.favorito ? 'fav' : ''}`}>
      <div className="avatar">
        {avatarUrl ? (
          <img src={avatarUrl} alt={`Avatar de ${alumno.nombre}`} />
        ) : (
          <div className="initials" aria-hidden>
            {initials}
          </div>
        )}
      </div>

      <div className="info">
        <div className="orden">
          <div className="top-line">
          <div className="nombre"><span className="name">{alumno.nombre}</span></div>
          <div className="estrella"><button
            aria-pressed={alumno.favorito}
            title={alumno.favorito ? 'Quitar favorito' : 'Marcar favorito'}
            onClick={() => onToggleFavorito(alumno.id)}
            className="fav-btn"
          >
            {alumno.favorito ? '★' : '☆'}
          </button></div>
          
        </div>
        </div>

        <div className="meta">
          {alumno.telefono || '—'} 
        </div>
        <div className="meta">  Legajo: {alumno.legajo || '—'} </div>

        {alumno.github && (
          <div className="github">@{alumno.github}</div>
        )}
      </div>
    </article>
  );
}