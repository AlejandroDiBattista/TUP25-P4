import React from "react";

export default function Topbar({ value, onChange }) {
  return (
    <header className="topbar" role="banner" aria-label="Barra superior">
      <h1 className="title">Alumnos Programación 4</h1>

      <div style={{ flex: 1 }} />

      <div className="search" role="search" aria-label="Buscar contactos">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M21 21l-4.35-4.35"
            stroke="#999"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="11"
            cy="11"
            r="6"
            stroke="#999"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Buscar por nombre, teléfono o legajo"
          aria-label="Buscar por nombre, teléfono o legajo"
        />
      </div>
    </header>
  );
}
