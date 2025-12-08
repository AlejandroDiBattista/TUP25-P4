
import React from "react"

function ContactCard({ contacto, onToggleFav }) {
  const avatar = contacto.github
    ? `https://github.com/${contacto.github}.png?size=100`
    : null

  return (
    <div className="card">
      {avatar ? (
        <img className="profile" src={avatar} alt={contacto.nombre} />
      ) : (
        <div className="profile" style={{background: '#bbb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>
          {contacto.nombre.charAt(0)}
        </div>
      )}
      <div className="name">{contacto.nombre}</div>
      <div className="info"><span className="label">Tel:</span> {contacto.telefono}</div>
      <div className="info"><span className="label">Legajo:</span> {contacto.legajo}</div>
      <button className={contacto.favorito ? "star" : "star star-outline"} onClick={() => onToggleFav(contacto.id)}>
        ★
      </button>
    </div>
  )
}

export default ContactCard
