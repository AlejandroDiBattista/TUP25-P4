import React from "react";

export default function ContactCard({ alumno, toggleFavorito }) {
  const avatar = alumno.github
    ? `https://github.com/${alumno.github}.png?size=100`
    : null;

  // Iniciales si no tiene GitHub
  const initials = alumno.nombre
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="card">
      <div className="card-header">
        {avatar ? (
          <img src={avatar} alt={alumno.nombre} className="avatar" />
        ) : (
          <div className="avatar placeholder">{initials}</div>
        )}
        <button className="star" onClick={() => toggleFavorito(alumno.id)}>
          {alumno.favorito ? "⭐" : "☆"}
        </button>
      </div>
      <h4>{alumno.nombre}</h4>
      <p><b>Tel:</b> {alumno.telefono}</p>
      <p><b>Legajo:</b> {alumno.legajo}</p>
    </div>
  );
}
