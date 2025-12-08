import React from "react";
import ContactCard from "./ContactCard";
import "../Style.css";

export default function ContactSection({ title, contacts, onToggleFavorito }) {
  return (
    <section className="contact-section">
      <h2>{title}</h2>
      {contacts.length === 0 ? (
        <p className="contact-empty">No hay resultados.</p>
      ) : (
        contacts.map((alumno) => (
          <ContactCard
            key={alumno.id}
            alumno={alumno}
            onToggleFavorito={onToggleFavorito}
          />
        ))
      )}
    </section>
  );
}
