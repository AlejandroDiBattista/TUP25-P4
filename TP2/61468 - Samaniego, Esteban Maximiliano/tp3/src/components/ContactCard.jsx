import React from "react";
import "../styles/ContactCard.css";

const ContactCard = ({ onToggleFavorito, ...alumno }) => {
  return (
    <div className={`contact-card ${alumno.favorite ? "favorite" : ""}`}>
      <div className="contact-avatar">
        {alumno.github ? (
          <img
            src={`https://github.com/${alumno.github}.png?size=100`}
            alt={alumno.nombre}
          />
        ) : (
          <div className="contact-placeholder" />
        )}
      </div>

      <div className="contact-info">
        <h4 className="contact-name">{alumno.nombre}</h4>
        <p className="contact-detail">
          <b>Tel:</b> {alumno.telefono}
        </p>
        <p className="contact-detail">
          <b>Legajo:</b> {alumno.legajo}
        </p>
      </div>

      <button
        className="contact-star"
        onClick={() => onToggleFavorito(alumno.id)}
      >
        {alumno.favorito ? "★" : "☆"}
      </button>
    </div>
  );
};

export default ContactCard;
