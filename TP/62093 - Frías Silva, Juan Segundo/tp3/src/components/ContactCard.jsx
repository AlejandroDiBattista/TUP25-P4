import React from "react";

export default function ContactCard({ alumno, onToggleFavorito }) {
  const { nombre, telefono, legajo, github, favorito } = alumno;

  // Avatar: GitHub o iniciales
  const avatarUrl = github
    ? `https://github.com/${github}.png?size=100`
    : null;
  const iniciales = nombre
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <div className="contact-card">
      {avatarUrl ? (
        <img src={avatarUrl} alt={nombre} className="avatar" />
      ) : (
        <div className="avatar-alt">{iniciales}</div>
      )}

      <div className="info">
        <h3>{nombre}</h3>
        <p>📞 {telefono}</p>
        <p>🆔 Legajo: {legajo}</p>
        {github && <p>🐙 GitHub: {github}</p>}
      </div>

      <button
        className={`fav-btn ${favorito ? "active" : ""}`}
        onClick={() => onToggleFavorito(legajo)}
      >
        {favorito ? "⭐" : "☆"}
      </button>
    </div>
  );
}

