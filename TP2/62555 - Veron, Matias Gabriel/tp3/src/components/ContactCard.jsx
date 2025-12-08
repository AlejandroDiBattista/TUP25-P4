import React from 'react'

export default function ContactCard({ alumno, toggleFavorito }) {
  const { nombre, telefono, legajo, github, favorito } = alumno
  const avatar = github
    ? `https://github.com/${github}.png?size=100`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=random`

  return (
    <div className="card">
      <img src={avatar} alt={nombre} className="avatar" />
      <div className="card-info">
        <h3>{nombre}</h3>
        <p><strong>Tel:</strong> {telefono}</p>
        <p><strong>Legajo:</strong> {legajo}</p>
      </div>
      <button
        className="star"
        onClick={() => toggleFavorito(alumno.id)}
        title={favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        {favorito ? '⭐' : '☆'}
      </button>
    </div>
  )
}
