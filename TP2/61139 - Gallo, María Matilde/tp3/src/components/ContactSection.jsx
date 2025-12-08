
import React from 'react';
import ContactCard from './ContactCard';

export default function ContactSection({ title, contacts, toggleFavorito }) {
  if (contacts.length === 0) return null;

  return (
    <div className="contact-section">
      <h2>{title} ({contacts.length})</h2>
      <div className="contact-list">
        {contacts.map(c => (
          <ContactCard key={c.id} alumno={c} toggleFavorito={toggleFavorito} />
        ))}
      </div>
    </div>
  );
}
