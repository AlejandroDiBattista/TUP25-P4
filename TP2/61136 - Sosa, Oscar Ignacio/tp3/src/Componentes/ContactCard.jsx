import React from 'react'

export default function ContactCard({ c, onToggleFav }) {
  const initials = c.nombre
    ? c.nombre.split(/\s+/).slice(0,2).map(p => p[0]).join('').toUpperCase()
    : ''

  const avatar = c.github ? `https://github.com/${c.github}.png?size=100` : null

  return (
    <article className="card">
      <div className="avatar">
        {avatar ? <img src={avatar} alt={`${c.nombre} avatar`} loading="lazy" />
                : <div className="initials">{initials}</div>}
      </div>
      <div className="info">
        <div className="line name">{c.nombre}</div>
        <div className="line small">Tel: {c.telefono || '—'}</div>
        <div className="line small">Legajo: {c.legajo}</div>
        {c.github && <div className="line small">GitHub: <a href={`https://github.com/${c.github}`} target="_blank" rel="noreferrer">{c.github}</a></div>}
      </div>
      <div className="actions">
        <button
          aria-pressed={c.favorito}
          title={c.favorito ? 'Quitar favorito' : 'Marcar favorito'}
          onClick={() => onToggleFav(c.id)}
          className={`fav-btn ${c.favorito ? 'fav' : ''}`}
        >
          {c.favorito ? '★' : '☆'}
        </button>
      </div>
    </article>
  )
}
