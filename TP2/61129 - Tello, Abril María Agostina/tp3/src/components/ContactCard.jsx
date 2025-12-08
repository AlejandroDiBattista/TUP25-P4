import React from "react";

function getInitials(nombre) {
  return nombre
    .split(" ")
    .map(p => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);
}

export default function ContactCard({ alumno, onToggleFav }) {
  const { nombre, telefono, legajo, github, favorito } = alumno;
  return (
    <div style={{
      border: "none",
      borderRadius: 16,
      padding: 20,
      minWidth: 260,
      maxWidth: 300,
      background: "#fff",
      boxShadow: "0 2px 12px 0 #0001",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      position: "relative"
    }}>
      <button
        onClick={() => onToggleFav(alumno.id)}
        title={favorito ? "Quitar de favoritos" : "Marcar como favorito"}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 22,
          color: favorito ? "#ffd700" : "#d0d0d0",
          transition: "color 0.2s"
        }}
        aria-label="Favorito"
      >
        ★
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 16, width: "100%", marginBottom: 12 }}>
        {github ? (
          <img src={`https://github.com/${github}.png?size=100`} alt={github} style={{ width: 56, height: 56, borderRadius: "50%", border: "2px solid #eee", objectFit: "cover" }} />
        ) : (
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#e6e6e6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 22, color: "#b0b0b0" }}>
            {getInitials(nombre)}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 17, color: "#222", marginBottom: 2, whiteSpace: "pre-line", wordBreak: "break-word" }}>{nombre}</div>
        </div>
      </div>
      <div style={{ fontSize: 15, color: "#444", marginBottom: 2 }}>
        <b>Tel:</b> {telefono}
      </div>
      <div style={{ fontSize: 15, color: "#444", marginBottom: github ? 6 : 0 }}>
        <b>Legajo:</b> {legajo}
      </div>
      {github && (
        <a href={`https://github.com/${github}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: "#0366d6", textDecoration: "none", fontWeight: 500 }}>
          @{github}
        </a>
      )}
    </div>
  );
}
