
import { useEffect, useMemo, useState } from 'react';
import ContactSection from './components/ContactSection';
import Topbar from './components/Topbar';
import { loadAlumnos } from './services/alumnos';
import { cmpNombre, includesContacto } from './utils/text';

function App() {
  const [alumnos, setAlumnos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar alumnos al montar el componente
  useEffect(() => {
    const alumnosData = loadAlumnos();
    setAlumnos(alumnosData);
  }, []);

  // Función para alternar favorito
  const toggleFavorito = (alumnoId) => {
    setAlumnos(prevAlumnos =>
      prevAlumnos.map(alumno =>
        alumno.id === alumnoId
          ? { ...alumno, favorito: !alumno.favorito }
          : alumno
      )
    );
  };

  // Filtrar y agrupar alumnos
  const { favoritos, noFavoritos } = useMemo(() => {
    // Filtrar por término de búsqueda
    const filtrados = searchTerm
      ? alumnos.filter(alumno => includesContacto(alumno, searchTerm))
      : alumnos;

    // Separar en favoritos y no favoritos
    const favs = filtrados.filter(alumno => alumno.favorito).sort(cmpNombre);
    const noFavs = filtrados.filter(alumno => !alumno.favorito).sort(cmpNombre);

    return {
      favoritos: favs,
      noFavoritos: noFavs
    };
  }, [alumnos, searchTerm]);

  const totalResultados = favoritos.length + noFavoritos.length;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa'
    }}>
      <Topbar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '0 20px 20px'
      }}>
        {totalResultados === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6c757d'
          }}>
            <p style={{ fontSize: '18px', margin: 0 }}>
              {searchTerm 
                ? `No se encontraron resultados para "${searchTerm}"`
                : 'No hay alumnos para mostrar'
              }
            </p>
          </div>
        ) : (
          <>
            <ContactSection
              title="Favoritos"
              contacts={favoritos}
              onToggleFavorito={toggleFavorito}
            />
            <ContactSection
              title="Alumnos"
              contacts={noFavoritos}
              onToggleFavorito={toggleFavorito}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App
