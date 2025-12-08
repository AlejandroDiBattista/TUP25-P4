import ContactCard from './ContactCard';
import React from 'react';
export default function ContactSection({ title, contacts, onToggle }) {
  return (
    <section>
      <h2>{title}</h2>
      {contacts?.length === 0 ? (
        <p>No hay alumnos en esta sección.</p>
      ) : (
        <div className="contact-grid">
          {contacts.map(alumno => (
            <ContactCard key={alumno.id} alumno={alumno} onToggle={onToggle} />
          ))}
        </div>
      )}
    </section>
  );
}