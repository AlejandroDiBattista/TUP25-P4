import React from "react";

export default function ContactCard({ alumno, onFav }) {
  return (
    <article>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {alumno.github ? (
          <img
            src={`https://github.com/${alumno.github}.png?size=100`}
            alt={alumno.nombre}
          />
        ) : (
          <div className="avatar-text">
            {alumno.nombre
              .split(" ")
              .map((x) => x[0])
              .join("")
              .toUpperCase()}
          </div>
        )}
        <div>
          <strong>{alumno.nombre}</strong>
          <div>Tel: {alumno.telefono}</div>
          <div>Legajo: {alumno.legajo}</div>
        </div>
        <button
          className={`star-btn${alumno.favorito ? "" : " inactive"}`}
          onClick={() => onFav(alumno.id)}
          aria-label={
            alumno.favorito ? "Quitar de favoritos" : "Marcar como favorito"
          }
        >
          {alumno.favorito ? "★" : "☆"}
        </button>
      </div>
    </article>
  );
}
