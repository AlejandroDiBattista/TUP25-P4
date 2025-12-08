import React from "react";
import ContactCard from "./ContactCard";

export default function ContactSection({ title, contacts, onFav }) {
  return (
    <section>
      <h2>
        {title}
        {contacts.length ? ` (${contacts.length})` : ""}
      </h2>
      {contacts.length === 0 ? (
        <p>No hay alumnos en esta sección.</p>
      ) : (
        <div>
          {contacts.map((alumno) => (
            <ContactCard key={alumno.id} alumno={alumno} onFav={onFav} />
          ))}
        </div>
      )}
    </section>
  );
}
