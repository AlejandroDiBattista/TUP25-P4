import React from "react";
import ContactCard from "./ContactCard.jsx";

export default function ContactSection({ title, contacts, onToggleFav }) {
  return (
    <section className="section container">
      <h2>{title} <span className="badge">({contacts.length})</span></h2>
      <div className="grid">
        {contacts.map((c) => (
          <ContactCard key={c.id} c={c} onToggleFav={onToggleFav} />
        ))}
      </div>
    </section>
  );
}
