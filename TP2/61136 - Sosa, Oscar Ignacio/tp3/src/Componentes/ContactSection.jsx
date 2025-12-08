import React from 'react'
import ContactCard from './ContactCard'

export default function ContactSection({ title, contacts, onToggleFav }) {
  return (
    <section className="section">
      <h2>{title} <span className="count">{contacts.length}</span></h2>
      <div className="list">
        {contacts.length === 0
          ? <div className="empty">No hay resultados</div>
          : contacts.map(c => <ContactCard key={c.id} c={c} onToggleFav={onToggleFav} />)}
      </div>
    </section>
  )
}
