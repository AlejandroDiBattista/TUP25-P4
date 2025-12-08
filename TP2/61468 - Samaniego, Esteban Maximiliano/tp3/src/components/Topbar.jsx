import React, { useState } from "react";
import "../styles/Topbar.css";

const Topbar = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="topbar-container">
      <h2 className="topbar-title">Alumnos Programación 4</h2>
      <div className="topbar-search-wrapper">
        <input
          type="text"
          placeholder="Buscar por nombre, teléfono o legajo"
          className="topbar-search-input"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};

export default Topbar;
