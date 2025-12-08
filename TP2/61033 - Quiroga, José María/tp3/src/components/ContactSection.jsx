import React from 'react';
import ContactCard from './ContactCard.jsx';

export default function ContactSection({ title, contacts, onToggleFavorito }) {
  if (!contacts.length) return null;
  return (
    <section>
      <h2>{title}</h2>
      <div className="contact-list">
        {contacts.map(alumno => (
          <ContactCard
            key={alumno.id}
            alumno={alumno}
            onToggleFavorito={onToggleFavorito}
          />
        ))}
      </div>
    </section>
  );
}