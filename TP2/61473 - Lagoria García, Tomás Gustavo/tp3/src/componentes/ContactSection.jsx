import React from 'react';
import ContactCard from './ContactCard';

export default function ContactSection({ title, contacts, onToggleFavorito }) {
  return (
    <section className="contact-section">
      <h2 className="section-title">{title}</h2>

      {contacts.length === 0 ? (
        <p className="empty">No hay resultados.</p>
      ) : (
        <div className="contact-list">
          {contacts.map((c) => (
            <ContactCard
              key={c.id}
              alumno={c}
              onToggleFavorito={onToggleFavorito}
            />
          ))}
        </div>
      )}
    </section>
  );
}