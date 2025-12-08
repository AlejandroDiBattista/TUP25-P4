import React, { useState, useEffect } from "react";
import { loadAlumnos } from "./services/alumnos";
import { cmpNombre, includesContacto } from "./utils/text";
import './App.css';

function App() {
  const [alumnos, setAlumnos] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    async function fetchAlumnos() {
      const data = await loadAlumnos();
      setAlumnos(data);
    }
    fetchAlumnos();
  }, []);

  const toggleFavorito = (id) => {
    setAlumnos((prevAlumnos) =>
      prevAlumnos.map((alumno) =>
        alumno.id === id ? { ...alumno, favorito: !alumno.favorito } : alumno
      )
    );
  };

  const getInitials = (name) => {
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const alumnosFiltrados = alumnos.filter((alumno) =>
    includesContacto(alumno, busqueda)
  );
  const favoritos = alumnosFiltrados
    .filter((alumno) => alumno.favorito)
    .sort(cmpNombre);
  const noFavoritos = alumnosFiltrados
    .filter((alumno) => !alumno.favorito)
    .sort(cmpNombre);

  return (
    <div className="app-container">
      <div className="topbar">
        <h1>Alumnos Programación 4</h1>
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por nombre, teléfono o legajo"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className="contact-section">
        <h2>Favoritos <span>({favoritos.length})</span></h2>
        <div className="contact-grid">
          {favoritos.length > 0 ? (
            favoritos.map((alumno) => (
              <div key={alumno.id} className="contact-card">
                <div className="avatar-container">
                  {alumno.github ? (
                    <img
                      src={`https://github.com/${alumno.github}.png?size=100`}
                      alt={`${alumno.nombre} avatar`}
                      className="avatar-image"
                    />
                  ) : (
                    <div className="avatar-initials">{getInitials(alumno.nombre)}</div>
                  )}
                </div>
                <div className="info-container">
                  <h3>{alumno.nombre}</h3>
                  <p>Tel: {alumno.telefono}</p>
                  <p>Legajo: {alumno.legajo}</p>
                  {alumno.github && <p className="github-username">@{alumno.github}</p>}
                </div>
                <button
                  onClick={() => toggleFavorito(alumno.id)}
                  className={`fav-button ${alumno.favorito ? 'is-favorite' : ''}`}
                >
                  {alumno.favorito ? '★' : '☆'}
                </button>
              </div>
            ))
          ) : (
            <p className="no-results-message">No hay alumnos favoritos.</p>
          )}
        </div>
      </div>

      <div className="contact-section">
        <h2>Contactos <span>({noFavoritos.length})</span></h2>
        <div className="contact-grid">
          {noFavoritos.length > 0 ? (
            noFavoritos.map((alumno) => (
              <div key={alumno.id} className="contact-card">
                <div className="avatar-container">
                  {alumno.github ? (
                    <img
                      src={`https://github.com/${alumno.github}.png?size=100`}
                      alt={`${alumno.nombre} avatar`}
                      className="avatar-image"
                    />
                  ) : (
                    <div className="avatar-initials">{getInitials(alumno.nombre)}</div>
                  )}
                </div>
                <div className="info-container">
                  <h3>{alumno.nombre}</h3>
                  <p>Tel: {alumno.telefono}</p>
                  <p>Legajo: {alumno.legajo}</p>
                  {alumno.github && <p className="github-username">@{alumno.github}</p>}
                </div>
                <button
                  onClick={() => toggleFavorito(alumno.id)}
                  className={`fav-button ${alumno.favorito ? 'is-favorite' : ''}`}
                >
                  {alumno.favorito ? '★' : '☆'}
                </button>
              </div>
            ))
          ) : (
            <p className="no-results-message">No hay alumnos disponibles.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;