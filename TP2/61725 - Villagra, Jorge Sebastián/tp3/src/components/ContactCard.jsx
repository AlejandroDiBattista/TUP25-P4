import React from "react";
import "../stylecomponents/ContactCard.css";
function ContactCard({ alumno, toggleFavorito, isFavorito }) {
  const avatar = alumno.github
    ? `https://github.com/${alumno.github}.png?size=100`
    : null;

  const iniciales = alumno.nombre?.split(" ")
    .map(p => p[0])
    .join("")
    .toUpperCase() ?? "?";

  return (
    <article className="contact-card">
      <div className="contact-card__main">
        {avatar ? (
          <img
            className="contact-card__avatar"
            src={avatar}
            alt={alumno.github}
            width={48}
            height={48}
          />
        ) : (
          <span className="contact-card__initiales">
            {iniciales}
          </span>
        )}
        <div>
          <strong>{alumno.nombre ?? "Sin nombre"}</strong>
          <div>📞 {alumno.telefono ?? "N/A"}</div>
          <div>Legajo: {alumno.legajo ?? "N/A"}</div>
          {alumno.github && <div>GitHub: {alumno.github}</div>}
        </div>
      </div>
      <button
        className="contact-card__fav-btn"
        onClick={() => toggleFavorito(alumno.id)}
      >
        {isFavorito ? "★ Quitar favorito" : "☆ Marcar favorito"}
      </button>
    </article>
  );
}
export default ContactCard;
