import React from 'react'
import ContactCard from './ContactCard'

export default function ContactSection({ title, contacts, onToggleFav }) {
  return (
    <section className="section">
      <h2>{title} ({contacts.length})</h2>
      {contacts.length === 0 ? (
        <div className="empty">No hay resultados</div>
      ) : (
        <div className="list">
          {contacts.map(c => (
            <ContactCard key={c.id} contact={c} onToggleFav={() => onToggleFav(c.id)} />
          ))}
        </div>
      )}
    </section>
  )
}
