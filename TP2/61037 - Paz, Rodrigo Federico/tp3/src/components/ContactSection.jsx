import React from 'react'
import ContactCard from './ContactCard'

export default function ContactSection({ title, contacts, onToggleFavorite, emptyMessage }) {
  return (
    <section className="section">
      <h2 className="section-title">{title}</h2>
      {contacts.length === 0 ? (
        <p className="empty">{emptyMessage}</p>
      ) : (
        <div className="grid">
          {contacts.map(c => (
            <ContactCard key={c.id} contact={c} onToggleFavorite={() => onToggleFavorite(c.id)} />
          ))}
        </div>
      )}
    </section>
  )
}