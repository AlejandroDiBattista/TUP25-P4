import React, { useState, useEffect } from 'react';
import { cargarAlumnos } from './services/alumnos';
import { compararNombre, includesContacto } from './utils/text';
import BarraSuperior from './componentes/BarraSuperior';
import SeccionContactos from './componentes/SeccionContactos';
import "./styles/App.css"

function App() {
  const [alumnos, setAlumnos] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
  const fetchAlumnos = async () => {
    const alumnosCargados = await cargarAlumnos();
    setAlumnos(alumnosCargados);
  };
  fetchAlumnos();
}, []);

  const manejarAlternarFavorito = (id) => {
    setAlumnos(prevAlumnos =>
      prevAlumnos.map(alumno =>
        alumno.id === id ? { ...alumno, favorito: !alumno.favorito } : alumno
      )
    );
  };

  const alumnosFiltrados = alumnos.filter(alumno =>
    includesContacto(alumno, busqueda)
  );

  const favoritos = alumnosFiltrados
    .filter(alumno => alumno.favorito)
    .sort(compararNombre);

  const noFavoritos = alumnosFiltrados
    .filter(alumno => !alumno.favorito)
    .sort(compararNombre);

  return (
    <div className="contenedor-app">
      <BarraSuperior busqueda={busqueda} setBusqueda={setBusqueda} />
      <main className="contenido-principal">
        {favoritos.length > 0 && (
          <SeccionContactos
            titulo={`Favoritos (${favoritos.length})`}
            contactos={favoritos}
            onAlternarFavorito={manejarAlternarFavorito}
          />
        )}
        {noFavoritos.length > 0 && (
          <SeccionContactos
            titulo={`Contactos (${noFavoritos.length})`}
            contactos={noFavoritos}
            onAlternarFavorito={manejarAlternarFavorito}
          />
        )}
        {favoritos.length === 0 && noFavoritos.length === 0 && (
          <p className="mensaje-vacio">No se encontraron resultados.</p>
        )}
      </main>
    </div>
  );
}

export default App;