import React, { useState, useEffect } from 'react';
import { loadAlumnos } from './services/alumnos.js';
import { includesContacto, cmpNombre } from './utils/text.js';
import SearchBar from './components/SearchBar.jsx';
import ContactSection from './components/ContactSection.jsx';

function App() {
  const [alumnos, setAlumnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [alumnosFiltrados, setAlumnosFiltrados] = useState([]);
  const [favoritos, setFavoritos] = useState(new Set());

  // Estilos simples y directos
  const headerStyles = {
    textAlign: 'center',
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const titleStyles = {
    fontSize: '2rem',
    color: '#333',
    marginBottom: '10px'
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        const datosAlumnos = await loadAlumnos();
        setAlumnos(datosAlumnos);
        setAlumnosFiltrados(datosAlumnos);
        setError(null);
      } catch (err) {
        setError('No se pudieron cargar los datos de los alumnos');
      } finally {
        setCargando(false);
      }
    };
    
    cargarDatos();
  }, []);

  useEffect(() => {
    let alumnosParaMostrar = alumnos;
    
    if (busqueda.trim()) {
      alumnosParaMostrar = alumnos.filter(alumno => 
        includesContacto(alumno, busqueda)
      );
    }
    
    const alumnosConFavoritos = alumnosParaMostrar.map(alumno => ({
      ...alumno,
      esFavorito: favoritos.has(alumno.legajo)
    }));
    
    const favoritosArray = alumnosConFavoritos.filter(a => a.esFavorito).sort(cmpNombre);
    const noFavoritosArray = alumnosConFavoritos.filter(a => !a.esFavorito).sort(cmpNombre);
    
    setAlumnosFiltrados([...favoritosArray, ...noFavoritosArray]);
  }, [alumnos, busqueda, favoritos]);

  const toggleFavorito = (legajo) => {
    setFavoritos(favoritosActuales => {
      const nuevosFavoritos = new Set(favoritosActuales);
      if (nuevosFavoritos.has(legajo)) {
        nuevosFavoritos.delete(legajo);
      } else {
        nuevosFavoritos.add(legajo);
      }
      return nuevosFavoritos;
    });
  };

  // Estados simples
  if (cargando) {
    return (
      <div className="app-container">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h1>📚 Directorio de Alumnos</h1>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
          <h1>❌ Error</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const favoritosArray = alumnosFiltrados.filter(a => a.esFavorito);
  const noFavoritosArray = alumnosFiltrados.filter(a => !a.esFavorito);

  return (
    <div className="app-container">
      <header style={headerStyles}>
        <h1 style={titleStyles}>📚 Directorio de Alumnos</h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>
          Total: <strong>{alumnos.length}</strong> alumnos
        </p>
        
        <SearchBar 
          totalAlumnos={alumnos.length}
          alumnosFiltrados={alumnosFiltrados.length}
          onBusqueda={setBusqueda}
        />
      </header>
      
      <main>
        {alumnosFiltrados.length === 0 && busqueda.trim() ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            backgroundColor: '#fff3cd', 
            borderRadius: '8px',
            color: '#856404'
          }}>
            <h3>🔍 No se encontraron resultados</h3>
            <p>No hay alumnos que coincidan con "{busqueda}"</p>
          </div>
        ) : (
          <>
            {favoritosArray.length > 0 && (
              <ContactSection 
                titulo="⭐ Favoritos"
                alumnos={favoritosArray}
                onToggleFavorito={toggleFavorito}
                esFavoritos={true}
              />
            )}
            
            <ContactSection 
              titulo={favoritosArray.length > 0 ? "👥 Todos los demás" : null}
              alumnos={noFavoritosArray}
              onToggleFavorito={toggleFavorito}
              esFavoritos={false}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
