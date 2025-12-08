
import React from "react"
import ContactCard from "./ContactCard"

function ContactSection({ title, contacts, onToggleFav }) {
  return (
    <section>
      {contacts.length === 0 ? (
        <p>No hay resultados</p>
      ) : (
        <div className="cards-row">
          {contacts.map(c => (
            <ContactCard
              key={c.id}
              contacto={c}
              onToggleFav={onToggleFav}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default ContactSection
