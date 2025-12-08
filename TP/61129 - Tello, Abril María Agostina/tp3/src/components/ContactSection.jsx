import React from "react";
import ContactCard from "./ContactCard";

export default function ContactSection({ title, contacts, onToggleFav }) {
  if (!contacts.length) return null;
  return (
    <section style={{ marginBottom: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0 12px 0" }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0, color: "#222" }}>
          {title} <span style={{ color: "#888", fontWeight: 400, fontSize: 16 }}>({contacts.length})</span>
        </h2>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
        {contacts.map(alumno => (
          <ContactCard key={alumno.id} alumno={alumno} onToggleFav={onToggleFav} />
        ))}
      </div>
    </section>
  );
}
