import React from "react";

export default function Topbar({ value, onChange }) {
  return (
    <header style={{
      display: "flex",
      alignItems: "center",
      gap: 24,
      padding: "24px 32px 20px 32px",
      background: "#fff",
      boxShadow: "0 2px 8px 0 #0001",
      borderBottom: "1px solid #f0f0f0",
      position: "sticky",
      top: 0,
      zIndex: 10
    }}>
      <h1 style={{
        margin: 0,
        fontSize: 28,
        fontWeight: 700,
        flex: 1,
        color: "#222"
      }}>
        Alumnos Programación 4
      </h1>
      <div style={{ position: "relative", width: 320 }}>
        <input
          type="search"
          placeholder="Buscar por nombre, teléfono o legajo"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            fontSize: 16,
            padding: "10px 40px 10px 16px",
            borderRadius: 8,
            border: "1px solid #e0e0e0",
            width: "100%",
            background: "#fafbfc"
          }}
        />
        <span style={{
          position: "absolute",
          right: 14,
          top: "50%",
          transform: "translateY(-50%)",
          color: "#bbb",
          fontSize: 20
        }}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </span>
      </div>
    </header>
  );
}
