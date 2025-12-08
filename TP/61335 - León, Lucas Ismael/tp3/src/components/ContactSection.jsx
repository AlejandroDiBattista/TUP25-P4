import ContactCard from "./ContactCard";
import React from "react";

export default function ContactSection({ title, contacts, toggleFavorito }) {
  if (contacts.length === 0) return null;

  return (
    <section>
      <h3>{title} ({contacts.length})</h3>
      <div className="grid">
        {contacts.map((c) => (
          <ContactCard
            key={c.id}
            alumno={c}
            toggleFavorito={toggleFavorito}
          />
        ))}
      </div>
    </section>
  );
}
