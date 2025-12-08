import React from "react";

export default function ContactCard({ alumno, onToggle }) {
  const avatarUrl = alumno.github
    ? `https://github.com/${alumno.github}.png?size=100`
    : null;

  const iniciales = alumno.nombre
    .split(" ")
    .map(p => p[0])
    .join("")
    .toUpperCase();

  return (
    <div className="contact-card">
      <div className={`contact-avatar ${!avatarUrl ? "initials" : ""}`}>
        {avatarUrl ? <img src={avatarUrl} alt={alumno.nombre} /> : iniciales}
      </div>

      <div className="contact-info">
        <div className="contact-name">{alumno.nombre}</div>
        <div>📞 {alumno.telefono}</div>
        <div>🎓 Legajo: {alumno.legajo}</div>
      </div>

      <button
        className={`fav-btn ${alumno.favorito ? "fav" : ""}`}
        onClick={() => onToggle(alumno.id)}
      >
        ★
      </button>
    </div>
  );
}

