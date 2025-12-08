import React from "react";
import ContactCard from "./ContactCard";

export default function ContactSection({ title, contacts, onToggleFavorito }) {
  return (
    <section className="contact-section">
      <h2>{title}</h2>
      {contacts.length === 0 ? (
        <p className="empty">No hay alumnos en esta lista.</p>
      ) : (
        <div className="contact-list">
          {contacts.map((alumno) => (
            <ContactCard
              key={alumno.id}
              alumno={alumno}
              onToggleFavorito={onToggleFavorito}
            />
          ))}
        </div>
      )}
    </section>
  );
}
