import React from 'react';
import ContactCard from './ContactCard';

export default function ContactSection({ title, contacts, onToggleFav }) {
  return (
    <section>
      <h2>{title}</h2>
      {contacts.length === 0 ? (
        <p>No hay alumnos en esta sección.</p>
      ) : (
        <ul>
          {contacts.map(alumno => (
            <li key={alumno.id}>
              <ContactCard alumno={alumno} onToggleFav={onToggleFav} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
