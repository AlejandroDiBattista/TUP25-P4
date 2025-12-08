import React from "react";
import "./Topbar.css";

export default function Topbar({ onSearch }) {
  return (
    <header className="topbar">
      <h1 className="topbar-title">Alumnos Programación 4</h1>
      <div className="search-wrapper">
        <input
          className="search-input"
          type="search"
          placeholder="Buscar por nombre, teléfono o legajo"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
    </header>
  );
}
