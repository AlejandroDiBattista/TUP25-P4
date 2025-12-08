// src/App.jsx
import React, { useState } from "react";
import { loadAlumnos } from "./services/alumnos";
import { cmpNombre, includesContacto } from "./utils/text";
import './App.css';

function Avatar({ nombre, github }) {
  if (github && typeof github === "string" && github.trim() !== "") {
    return (
      <img
        src={`https://github.com/${github}.png`}  // <-- corregido
        alt={nombre}
        className="avatar"
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          border: "2px solid #eee",
          objectFit: "cover",
        }}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }
  const iniciales = nombre
    .split(" ")
    .map(p => p[0])
    .join("")
    .toUpperCase();
  const colores = ["#e0c3fc", "#fceabb", "#b5ead7", "#c7ceea", "#f7cac9"];
  const color = colores[nombre.charCodeAt(0) % colores.length];
  return (
    <div
      className="avatar"
      style={{
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        background: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "600",
        fontSize: "1.1rem",
        color: "#333",
        border: "2px solid #eee",
      }}
    >
      {iniciales}
    </div>
  );
}

function ContactCard({ contacto, onToggleFavorito }) {
  return (
    <div className="card">
      <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Avatar nombre={contacto.nombre} github={contacto.github} />
        <button
          className={contacto.favorito ? "star" : "star inactive"}
          onClick={() => onToggleFavorito(contacto.id)}
          aria-label="Marcar como favorito"
          style={{
            fontSize: "1.5rem",
            color: contacto.favorito ? "#d4a017" : "#d3d3d3",
            transition: "color .2s",
            background: "none",
            border: "none",
            cursor: "pointer"
          }}
        >
          {contacto.favorito ? "⭐" : "☆"}
        </button>
      </div>
      <div className="nombre" style={{ marginTop: ".5rem" }}>{contacto.nombre}</div>
      <div className="info">Tel: {contacto.telefono}</div>
      <div className="info">Legajo: {contacto.legajo}</div>
    </div>
  );
}

function ContactSection({ title, contactos, onToggleFavorito }) {
  if (contactos.length === 0) return null;
  return (
    <div className="mb-6">
      <h2 className="font-bold mb-2">{title} ({contactos.length})</h2>
      <div className="grid">
        {contactos.map(c => (
          <ContactCard
            key={c.id}
            contacto={c}
            onToggleFavorito={onToggleFavorito}
          />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [alumnos, setAlumnos] = useState(() => loadAlumnos());
  const [query, setQuery] = useState("");

  const toggleFavorito = (id) => {
    setAlumnos(alumnos.map(c =>
      c.id === id ? { ...c, favorito: !c.favorito } : c
    ));
  };

  const filtrados = alumnos.filter(c => includesContacto(c, query));
  const favoritos = filtrados.filter(c => c.favorito).sort(cmpNombre);
  const resto = filtrados.filter(c => !c.favorito).sort(cmpNombre);

  return (
    <div className="p-6">
      <h1 style={{ fontSize: "2.2rem", textAlign: "center", marginBottom: "1.5rem" }}>
        Alumnos Programación 4
      </h1>
      <div className="busqueda-centro">
        <input
          type="search"
          placeholder="Buscar por nombre, teléfono o legajo"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {filtrados.length === 0 ? (
        <p style={{ textAlign: "center", color: "#555" }}>No hay resultados</p>
      ) : (
        <>
          <ContactSection
            title="Favoritos"
            contactos={favoritos}
            onToggleFavorito={toggleFavorito}
          />
          <ContactSection
            title="Contactos"
            contactos={resto}
            onToggleFavorito={toggleFavorito}
          />
        </>
      )}
    </div>
  );
}