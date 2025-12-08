import React from "react";
import ContactCard from "./ContactCard";
import "./ContactSection.css";

export default function ContactSection({
  title,
  contacts = [],
  onToggleFavorite,
}) {
  return (
    <section className="contact-section">
      <h2 className="section-title">
        {title} <span className="count">({contacts.length})</span>
      </h2>
      <div className="contacts-grid">
        {contacts.map((contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </section>
  );
}
