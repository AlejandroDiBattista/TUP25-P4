import React from 'react';
import ContactCard from './ContactCard';

export default function ContactSection({ title, contacts, onToggleFavorito }) {
  return (
    <section>
      <h2>{title}</h2>
      {contacts.length === 0 ? (
        <div className="empty">No hay alumnos en esta sección.</div>
      ) : (
        <div className="contact-list">
          {contacts.map(alumno => (
            <ContactCard
              key={alumno.id}
              alumno={alumno}
              onToggleFavorito={() => onToggleFavorito(alumno.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
