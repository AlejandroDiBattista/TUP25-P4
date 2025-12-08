// src/components/ContactSection.jsx
import React from "react";
import ContactCard from "./ContactCard";

export default function ContactSection({ title, contactos, onToggleFavorito }) {
  return (
    <section>
      <div className="section-title">{title}</div>

      {contactos.length === 0 ? (
        <div className="empty">No se encontraron contactos.</div>
      ) : (
        <div className="cards-grid" role="list" aria-label={title}>
          {contactos.map((c) => (
            <div key={c.id} role="listitem">
              <ContactCard alumno={c} onToggleFavorito={onToggleFavorito} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
