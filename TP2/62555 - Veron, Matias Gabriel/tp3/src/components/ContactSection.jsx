import React from 'react'
import ContactCard from './ContactCard'

export default function ContactSection({ title, contacts, toggleFavorito }) {
  if (contacts.length === 0) return null

  return (
    <section className="contact-section">
      <h2>{title} ({contacts.length})</h2>
      <div className="grid">
        {contacts.map((alumno) => (
          <ContactCard
            key={alumno.id}
            alumno={alumno}
            toggleFavorito={toggleFavorito}
          />
        ))}
      </div>
    </section>
  )
}
