// src/components/ContactCard.jsx
import React from "react";

function initials(name = "") {
  if (!name) return "";
  const clean = name.replace(/\s+/g, " ").trim();
  const parts = clean.split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ContactCard({ alumno, onToggleFavorito }) {
  const { nombre, telefono, legajo, github, favorito } = alumno;
  const avatarUrl = github ? `https://github.com/${github}.png?size=100` : null;

  return (
    <article className="card" aria-label={`Contacto ${nombre}`}>
      <div className="avatar" title={github ? `GitHub: ${github}` : ""}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={`${nombre} avatar`}
            onError={(e) => {
              e.target.style.display = "none";
            }}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : null}
        {!avatarUrl && (
          <div style={{ fontWeight: 700 }}>{initials(nombre)}</div>
        )}
      </div>

      <div className="card-body">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div className="name">{nombre}</div>
          </div>

          <div className="controls">
            <button
              className="star-btn"
              aria-pressed={favorito}
              aria-label={favorito ? "Quitar favorito" : "Marcar favorito"}
              onClick={() => onToggleFavorito(alumno.id)}
              title={favorito ? "Quitar favorito" : "Marcar favorito"}
            >
              <span
                style={{
                  fontSize: 18,
                  color: favorito ? "#f7b82b" : "#c4c7cc",
                }}
              >
                {favorito ? "★" : "☆"}
              </span>
            </button>
          </div>
        </div>

        <div className="meta">
          <div>
            <strong>Tel:</strong> <a href={`tel:${telefono}`}>{telefono}</a>
          </div>
          <div>
            <strong>Legajo:</strong> {legajo || "-"}
          </div>
          {github ? (
            <div>
              <strong>GitHub:</strong> {github}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
