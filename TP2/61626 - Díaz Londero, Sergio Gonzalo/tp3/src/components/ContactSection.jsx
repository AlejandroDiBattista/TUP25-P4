import React from "react";
import "./ContactSection.css";
import ContactCard from "./ContactCard";

export default function ContactSection({ title, contacts, onToggleFav }) {
  return (
    <section style={{ marginBottom: "2rem" }}>
      <h2 style={{ marginBottom: "1rem" }}>{title}</h2>
      {contacts.length === 0 ? (
        <div style={{ color: "#888" }}>No hay alumnos en esta lista.</div>
      ) : (
        <div
          className="contact-grid"
        >
          {contacts.map(alumno => (
            <ContactCard key={alumno.id} alumno={alumno} onToggleFav={onToggleFav} />
          ))}
        </div>
      )}
    </section>
  );
}
