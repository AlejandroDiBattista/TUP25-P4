import React, { useState } from "react";
import ContactCard from "../components/ContactCard";
import Topbar from "../components/Topbar";
import "../styles/ContactSection.css";
import loadAlumnos from "../services/alumnos.js";
import { includesContacto } from "../utils/text.js";

const ContactSection = () => {
  const [alumnos, setAlumnos] = useState(loadAlumnos());
  const [favoritos, setFavoritos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleFavorite = (id) => {
    const updatedAlumnos = alumnos.map((alumno) =>
      alumno.id === id ? { ...alumno, favorite: !alumno.favorite } : alumno
    );
    const updatedFavoritos = updatedAlumnos.filter((a) => a.favorite);
    setFavoritos(updatedFavoritos);
    setAlumnos(updatedAlumnos);
  };

  // Filtrado de alumnos y favoritos según búsqueda
  const alumnosFiltrados = alumnos.filter((alumno) =>
    includesContacto(alumno, searchTerm)
  );
  const favoritosFiltrados = favoritos.filter((alumno) =>
    includesContacto(alumno, searchTerm)
  );

  return (
    <div className="contact-section">
      <Topbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <h2>Favoritos</h2>
      <div className="contact-fav contact-list">
        {favoritosFiltrados.map((alumno, idx) => (
          <ContactCard
            key={idx}
            onToggleFavorito={toggleFavorite}
            {...alumno}
          />
        ))}
        {favoritosFiltrados.length === 0 && <p>No hay contactos favoritos.</p>}
      </div>

      <hr />

      <h2>Contactos</h2>
      <div className="contact-list">
        {alumnosFiltrados.map((alumno, idx) => (
          <ContactCard
            key={idx}
            onToggleFavorito={toggleFavorite}
            {...alumno}
          />
        ))}
      </div>
    </div>
  );
};

export default ContactSection;
