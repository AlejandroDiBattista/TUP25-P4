import React from "react";

function ContactCard({ alumno, toggleFavorito, isFavorito }) {
  const avatar = alumno.github
    ? `https://github.com/${alumno.github}.png?size=100`
    : null;

  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "1rem",
        width: "220px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        background: "#fff"
      }}
    >
      <div>
        {avatar ? (
          <img
            src={avatar}
            alt={alumno.nombre}
            style={{ width: "80px", height: "80px", borderRadius: "50%" }}
          />
        ) : (
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "#ddd",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "24px",
            }}
          >
            {alumno.nombre[0].toUpperCase() ?? "?"}
          </div>
        )}
      </div>

      <div style={{ marginTop: "0.5rem" }}>
        <h3 style={{ margin: "0.3rem 0" }}>{alumno.nombre}</h3>
        <p style={{ margin: "0.2rem 0" }}>📞 {alumno.telefono}</p>
        <p style={{ margin: "0.2rem 0" }}>🎓 Legajo: {alumno.legajo}</p>
      </div>

      <button
        onClick={() => toggleFavorito(alumno.id)}
        style={{
          background: "none",
          border: "none",
          fontSize: "28px",
          cursor: "pointer",
          marginTop: "0.5rem",
          color: isFavorito ? "#f5b400" : "#666"
        }}

      >
        {isFavorito ? "★" : "☆"}
      </button>
    </div>
  );
}

export default ContactCard;

