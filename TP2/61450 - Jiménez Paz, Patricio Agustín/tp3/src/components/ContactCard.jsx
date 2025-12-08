import React from 'react'

function Avatar({ nombre, github }) {
  if (github) {
    const url = `https://github.com/${github}.png?size=100`
    return <img src={url} alt={github} className="avatar" />
  }
  // fallback: initials
  const initials = (nombre || '')
    .split(' ')
    .map(p => p[0])
    .filter(Boolean)
    .slice(0,2)
    .join('')
    .toUpperCase()
  return <div className="avatar fallback">{initials}</div>
}

export default function ContactCard({ contact, onToggleFav }) {
  return (
    <article className="card">
      <Avatar nombre={contact.nombre} github={contact.github} />
      <div className="meta">
        <p className="name">{contact.nombre}</p>
        <p className="phone"><span>Teléfono:</span> {contact.telefono}</p>
        <p className="legajo"><span>Legajo:</span> {contact.legajo}</p>
      </div>
      <button className={`fav ${contact.favorito ? 'on' : ''}`} onClick={onToggleFav} title="Marcar favorito">
        ★
      </button>
    </article>
  )
}
