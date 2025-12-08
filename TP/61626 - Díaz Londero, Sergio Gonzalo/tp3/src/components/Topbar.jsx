import React from "react";

export default function Topbar({ value, onChange }) {
  return (
    <header style={{ display: "flex", alignItems: "center", padding: "1rem", background: "#f5f5f5" }}>
      <h1 style={{ flex: 1, margin: 0 }}>Directorio de Alumnos</h1>
      <input
        type="text"
        placeholder="Buscar por nombre, teléfono o legajo..."
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          marginLeft: "1rem",  
          padding: "0.5rem",
          fontSize: "1rem",
          width: "300px",
          borderRadius: "1rem",
          border: "1px solid #ccc"
        }}
      />
    </header>
  );
}
