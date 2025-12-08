import React, { useState, useEffect } from "react";
import Topbar from "./components/Topbar";
import ContactSection from "./components/ContactSection";
import { loadAlumnos } from "./services/alumnos";
import { normalizar } from "./utils/text";
import "./App.css";

function App() {
  const [alumnos, setAlumnos] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const data = loadAlumnos();
    setAlumnos(data);
  }, []);

  const handleSearch = (termino) => {
    setBusqueda(termino);
  };

  const handleToggleFavorite = (id) => {
    setAlumnos(
      alumnos.map((alumno) =>
        alumno.id === id ? { ...alumno, favorito: !alumno.favorito } : alumno
      )
    );
  };

  const includesContacto = (contacto, busqueda) => {
    const busquedaNorm = normalizar(busqueda);
    const { nombre, legajo, telefono } = contacto;

    return (
      normalizar(nombre).includes(busquedaNorm) ||
      normalizar(legajo).includes(busquedaNorm) ||
      normalizar(telefono).includes(busquedaNorm)
    );
  };

  const cmpNombre = (a, b) => {
    return normalizar(a.nombre).localeCompare(normalizar(b.nombre));
  };

  const alumnosFiltrados = busqueda
    ? alumnos.filter((alumno) => includesContacto(alumno, busqueda))
    : alumnos;

  const favoritos = alumnosFiltrados.filter((a) => a.favorito);
  const resto = alumnosFiltrados.filter((a) => !a.favorito);

  favoritos.sort(cmpNombre);
  resto.sort(cmpNombre);

  const noResults = alumnosFiltrados.length === 0 && busqueda !== "";

  return (
    <div className="app-container">
      <Topbar onSearch={handleSearch} />
      <main className="main-content">
        {noResults ? (
          <p>No se encontraron resultados para "{busqueda}"</p>
        ) : (
          <>
            {favoritos.length > 0 && (
              <ContactSection
                title="Favoritos"
                contacts={favoritos}
                onToggleFavorite={handleToggleFavorite}
              />
            )}
            <ContactSection
              title="Contactos"
              contacts={resto}
              onToggleFavorite={handleToggleFavorite}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
