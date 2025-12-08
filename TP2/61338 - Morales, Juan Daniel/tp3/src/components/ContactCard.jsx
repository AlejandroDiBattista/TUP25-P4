import React from "react";

function initialsFromName(name = "?") {
  return name.split(/\s+/).filter(Boolean).slice(0,2).map(p=>p[0]?.toUpperCase()).join("");
}

export default function ContactCard({ c, onToggleFav }) {
  const avatarUrl = c.github ? `https://github.com/${c.github}.png?size=100` : null;
  return (
    <article className="card" aria-label={`Alumno ${c.nombre}`}>
      <div className="cardHead">
        {avatarUrl ? (
          <img src={avatarUrl} alt={`Avatar de ${c.github}`} className="avatar" loading="lazy" />
        ) : (
          <div className="avatar" aria-hidden>{initialsFromName(c.nombre)}</div>
        )}
        <div>
          <div className="name">{c.nombre}</div>
          <div className="meta">
            <div><strong>Tel:</strong> {c.telefono || "—"}</div>
            <div><strong>Legajo:</strong> {c.legajo}</div>
          </div>
        </div>
        <button className="starBtn" aria-pressed={c.favorito} onClick={() => onToggleFav(c.id)}>
          {c.favorito ? "★" : "☆"}
        </button>
      </div>
    </article>
  );
}
