
import React, { useState, useEffect } from 'react';
import { Topbar, ContactSection } from './components';
import { loadAlumnos } from './services/alumnos';
import { includesContacto, cmpNombre } from './utils/text';
import './App.css';

/**
 * Componente principal de la aplicación
 * Maneja el estado global y coordina todos los componentes
 */
function App() {
  // Estados de la aplicación
  const [alumnos, setAlumnos] = useState([]); // Lista completa de alumnos
  const [terminoBusqueda, setTerminoBusqueda] = useState(''); // Término actual de búsqueda
  const [cargando, setCargando] = useState(true); // Indica si estamos cargando los datos

  /**
   * Efecto que se ejecuta al montar el componente
   * Carga los datos de alumnos desde el archivo VCF
   */
  useEffect(() => {
    try {
      setCargando(true);
      // Como loadAlumnos ya no es async, podemos llamarla directamente
      const alumnosCargados = loadAlumnos();
      setAlumnos(alumnosCargados);
    } catch (error) {
      console.error('Error al cargar los alumnos:', error);
      setAlumnos([]);
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Alterna el estado de favorito de un alumno
   * @param {string} alumnoId - El ID del alumno a modificar
   */
  const handleToggleFavorito = (alumnoId) => {
    setAlumnos(alumnosActuales => 
      alumnosActuales.map(alumno => 
        alumno.id === alumnoId 
          ? { ...alumno, favorito: !alumno.favorito } // Cambiamos solo el favorito
          : alumno // Los demás quedan igual
      )
    );
  };

  /**
   * Actualiza el término de búsqueda
   * @param {string} nuevoTermino - El nuevo término de búsqueda
   */
  const handleBusquedaChange = (nuevoTermino) => {
    setTerminoBusqueda(nuevoTermino);
  };

  /**
   * Filtra y ordena los alumnos según el término de búsqueda
   * @returns {Object} Objeto con arrays de favoritos y otros
   */
  const obtenerAlumnosFiltrados = () => {
    // Primero filtramos por el término de búsqueda
    const alumnosFiltrados = alumnos.filter(alumno => 
      includesContacto(alumno, terminoBusqueda)
    );

    // Separamos favoritos de no favoritos
    const favoritos = alumnosFiltrados
      .filter(alumno => alumno.favorito)
      .sort((a, b) => cmpNombre(a.nombre, b.nombre)); // Ordenamos alfabéticamente

    const otros = alumnosFiltrados
      .filter(alumno => !alumno.favorito)
      .sort((a, b) => cmpNombre(a.nombre, b.nombre)); // Ordenamos alfabéticamente

    return { favoritos, otros };
  };

  // Obtenemos los alumnos filtrados y ordenados
  const { favoritos, otros } = obtenerAlumnosFiltrados();
  const totalResultados = favoritos.length + otros.length;

  // Si estamos cargando, mostramos un mensaje
  if (cargando) {
    return (
      <div className="app">
        <div className="app__loading">
          <p>Cargando directorio de alumnos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Barra superior con título y búsqueda */}
      <Topbar 
        terminoBusqueda={terminoBusqueda}
        onBusquedaChange={handleBusquedaChange}
      />

      {/* Contenido principal */}
      <main className="app__content">
        {totalResultados === 0 ? (
          // Mensaje cuando no hay resultados
          <div className="app__no-results">
            {terminoBusqueda ? (
              <p>No se encontraron alumnos que coincidan con "{terminoBusqueda}"</p>
            ) : (
              <p>No hay alumnos en el directorio</p>
            )}
          </div>
        ) : (
          // Mostramos las secciones de contactos
          <>
            {/* Sección de favoritos - solo si hay favoritos */}
            {favoritos.length > 0 && (
              <ContactSection
                title={`Favoritos (${favoritos.length})`}
                contacts={favoritos}
                onToggleFavorito={handleToggleFavorito}
              />
            )}

            {/* Sección de otros alumnos - solo si hay no favoritos */}
            {otros.length > 0 && (
              <ContactSection
                title={favoritos.length > 0 ? `Otros (${otros.length})` : `Alumnos (${otros.length})`}
                contacts={otros}
                onToggleFavorito={handleToggleFavorito}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
