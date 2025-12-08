import React, { useEffect, useState } from "react";
import { loadAlumnos } from "./services/alumnos";
import { cmpNombre, includesContacto } from "./utils/text";
import "./style.css";

function App() {
  const [alumnos, setAlumnos] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    loadAlumnos().then(data => {
      data.sort(cmpNombre);
      setAlumnos(data);
    });
  }, []);

  const filtrados = alumnos.filter(a =>
    busqueda ? includesContacto(a, busqueda) : true
  );

  const favoritos = filtrados.filter(a => a.favorito);
  const normales = filtrados.filter(a => !a.favorito);

  const toggleFavorito = (id) => {
    setAlumnos(alumnos.map(a =>
      a.id === id ? { ...a, favorito: !a.favorito } : a
    ));
  };

  return (
    <div>
      {/* Topbar */}
      <div className="topbar">
        <h1>Alumnos Programación 4</h1>
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Favoritos */}
      {favoritos.length > 0 && (
        <div className="section">
          <h2>⭐ Favoritos ({favoritos.length})</h2>
          <div className="grid">
            {favoritos.map(a => (
              <ContactCard key={a.id} alumno={a} toggleFavorito={toggleFavorito}/>
            ))}
          </div>
        </div>
      )}

      {/* Contactos */}
      <div className="section">
        <h2>📒 Contactos ({normales.length})</h2>
        <div className="grid">
          {normales.map(a => (
            <ContactCard key={a.id} alumno={a} toggleFavorito={toggleFavorito}/>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContactCard({ alumno, toggleFavorito }) {
  const avatar = alumno.github
    ? `https://github.com/${alumno.github}.png?size=100`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(alumno.nombre)}&size=100`;

  return (
    <div className="card">
      <div className="card-header">
        <img src={avatar} alt={alumno.nombre}/>
        <button onClick={() => toggleFavorito(alumno.id)}>
          {alumno.favorito ? "⭐" : "☆"}
        </button>
      </div>
      <h3>{alumno.nombre}</h3>
      <p>Tel: {alumno.telefono}</p>
      <p><strong>Legajo:</strong> {alumno.legajo}</p>
    </div>
  );
}

export default App;
