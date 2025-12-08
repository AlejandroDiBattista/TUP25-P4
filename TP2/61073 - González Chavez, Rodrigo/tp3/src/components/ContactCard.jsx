import React from "react";
import styles from "./ContactCard.module.css";

export default function ContactCard({ alumno, toggleFavorito }) {
  const avatar = alumno.github
    ? `https://github.com/${alumno.github}.png?size=100`
    : null;

  const iniciales = alumno.nombre
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className={styles.card}>
      {avatar ? (
        <img src={avatar} alt={alumno.nombre} className={styles.avatar} />
      ) : (
        <div className={styles.initials}>{iniciales}</div>
      )}

      <div className={styles.info}>
        <h3>{alumno.nombre}</h3>
        <p><strong>Tel:</strong> {alumno.telefono}</p>
        <p><strong>Legajo:</strong> {alumno.legajo}</p>
      </div>

      <button
        onClick={() => toggleFavorito(alumno.id)}
        className={styles.star}
      >
        {alumno.favorito ? "★" : "☆"}
      </button>
    </div>
  );
}
