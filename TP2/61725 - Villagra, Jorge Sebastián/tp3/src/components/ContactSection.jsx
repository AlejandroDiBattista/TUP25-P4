import React from "react";
import "../stylecomponents/ContactSection.css";
import ContactCard from "./ContactCard";

function ContactSection({ title, contacts, toggleFavorito }) {
  return (
    <section className="contact-section">
      <h2>{title}</h2>
      {contacts.length === 0 ? (
        <p>No hay resultados</p>
      ) : (
        <div className="contact-section__list">
          {contacts.map((c, i) => (
            <ContactCard
              key={c.id ?? i}
              alumno={c}
              toggleFavorito={toggleFavorito}
              isFavorito={c.favorito}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default ContactSection;
