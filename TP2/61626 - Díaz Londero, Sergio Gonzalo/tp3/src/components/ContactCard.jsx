import React from "react";

function getInitials(nombre) {
  return nombre
    .split(" ")
    .map(p => p[0])
    .join("")
    .toUpperCase();
}

export default function ContactCard({ alumno, onToggleFav }) {
  const avatar = alumno.github
    ? `https://github.com/${alumno.github}.png?size=100`
    : null;
  return (
    <div style={{ display: "flex", alignItems: "center", border: "1px solid #ddd", borderRadius: "8px", padding: "1rem", background: "#fff" }}>
      <div style={{ width: 60, height: 60, marginRight: 16, display: "flex", alignItems: "center", justifyContent: "center", background: "#eee", borderRadius: "50%", fontSize: 24 }}>
        {avatar ? (
          <img src={avatar} alt={alumno.github} style={{ width: 56, height: 56, borderRadius: "50%" }} />
        ) : (
          <span>{getInitials(alumno.nombre)}</span>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{alumno.nombre}</div>
        <div>Tel: {alumno.telefono}</div>
        <div>Legajo: {alumno.legajo}</div>
        {alumno.github && (
          <div>GitHub: <a href={`https://github.com/${alumno.github}`} target="_blank" rel="noopener noreferrer">{alumno.github}</a></div>
        )}
      </div>
      <button
        onClick={() => onToggleFav(alumno.id)}
        style={{ marginLeft: 16, fontSize: 24, background: "none", border: "none", cursor: "pointer" }}
        title={alumno.favorito ? "Quitar de favoritos" : "Marcar como favorito"}
      >
        {alumno.favorito ? "★" : "☆"}
      </button>
    </div>
  );
}
