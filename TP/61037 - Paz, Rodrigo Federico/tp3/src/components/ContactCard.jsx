import React from 'react'

function Initials({ nombre }) {

  const parts = nombre.split(' ').filter(Boolean)
  const i1 = parts[0] ? parts[0][0] : ''
  const i2 = parts[1] ? parts[1][0] : ''
  return (i1 + i2).toUpperCase()
}

export default function ContactCard({ contact, onToggleFavorite }) {
  const { nombre, telefono, legajo, github, favorito } = contact

  const avatar = github
    ? `https://github.com/${github}.png?size=100`
    : null

  return (
    <article className="card">
      <button className="fav" onClick={onToggleFavorite} title="Alternar favorito">
        {favorito ? '★' : '☆'}
      </button>

      <div className="card-left">
        <div className="avatar">
          {avatar ? (
            <img src={avatar} alt={`${nombre} avatar`} />
          ) : (
            <div className="initials" aria-hidden>
              <Initials nombre={nombre} />
            </div>
          )}
        </div>
      </div>

      <div className="card-body">
        <h3 className="card-name">{nombre}</h3>

        <div className="meta">
          <div><strong>Tel:</strong> {telefono}</div>
          <div><strong>Legajo:</strong> {legajo}</div>
        </div>
      </div>
    </article>
  )
}