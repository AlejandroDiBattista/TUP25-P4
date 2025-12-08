
import React, { useState, useEffect, useMemo } from 'react';
import { loadAlumnos } from './services/alumnos';
import { includesContacto, cmpNombre } from './utils/text';
import Topbar from './components/Topbar';
import ContactSection from './components/ContactSection';
import './App.css';

function App() {
  const [alumnos, setAlumnos] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  // Cargar datos al iniciar la aplicación
  useEffect(() => {
    try {
      const datos = loadAlumnos();
      setAlumnos(datos);
    } catch (error) {
      console.error('Error al cargar alumnos:', error);
    }
  }, []);

  // Función para alternar favoritos
  const toggleFavorito = (id) => {
    setAlumnos(prev => 
      prev.map(alumno => 
        alumno.id === id 
          ? { ...alumno, favorito: !alumno.favorito }
          : alumno
      )
    );
  };

  // Filtrar y ordenar alumnos
  const alumnosProcesados = useMemo(() => {
    // Filtrar por búsqueda
    const filtrados = alumnos.filter(alumno => 
      includesContacto(alumno, busqueda)
    );

    // Separar favoritos y no favoritos
    const favoritos = filtrados
      .filter(alumno => alumno.favorito)
      .sort((a, b) => cmpNombre(a.nombre, b.nombre));

    const noFavoritos = filtrados
      .filter(alumno => !alumno.favorito)
      .sort((a, b) => cmpNombre(a.nombre, b.nombre));

    return { favoritos, noFavoritos, total: filtrados.length };
  }, [alumnos, busqueda]);

  return (
    <div className="app">
      <Topbar 
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        totalContactos={alumnos.length}
        contactosFiltrados={alumnosProcesados.total}
      />
      
      <main className="main-content">
        {alumnosProcesados.total === 0 ? (
          <div className="empty-state">
            {busqueda ? (
              <>
                <h2>🔍 No se encontraron resultados</h2>
                <p>No hay alumnos que coincidan con "{busqueda}"</p>
                <button 
                  className="clear-search-btn"
                  onClick={() => setBusqueda('')}
                >
                  Limpiar búsqueda
                </button>
              </>
            ) : (
              <>
                <h2>📚 Cargando alumnos...</h2>
                <p>Por favor espera mientras cargamos el directorio.</p>
              </>
            )}
          </div>
        ) : (
          <>
            <ContactSection 
              title={`⭐ Favoritos (${alumnosProcesados.favoritos.length})`}
              contacts={alumnosProcesados.favoritos}
              onToggleFavorito={toggleFavorito}
            />
            
            <ContactSection 
              title={`👥 Todos los alumnos (${alumnosProcesados.noFavoritos.length})`}
              contacts={alumnosProcesados.noFavoritos}
              onToggleFavorito={toggleFavorito}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
