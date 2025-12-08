import React from "react";
import ContactCard from "./ContactCard";
import styles from "./ContactSection.module.css";

export default function ContactSection({ title, contacts, toggleFavorito }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>
          {title} ({contacts.length})
      </h2>

      {contacts.length === 0 ? (
        <p className={styles.empty}>No hay resultados</p>
      ) : (
        <div className={styles.list}>
          {contacts.map((c) => (
            <ContactCard
              key={c.id}
              alumno={c}
              toggleFavorito={toggleFavorito}
            />
          ))}
        </div>
      )}
    </section>
  );
}
