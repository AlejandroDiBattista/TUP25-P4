import React from "react";
import ContactCard from "./contactcard";

export default function ContactSection({ title, contacts, onToggle }) {
  if (contacts.length === 0) return null;

  return (
    <section>
      <h2>{title}</h2>
      <div className="cards-container">
        {contacts.map(a => (
          <ContactCard key={a.id} alumno={a} onToggle={onToggle} />
        ))}
      </div>
    </section>
  );
}