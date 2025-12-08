import { useEffect, useState } from 'react';
import { loadAlumnos } from './services/alumnos';
import { includesContacto, cmpNombre } from './utils/text';
import Topbar from './components/topbar';
import ContactSection from './components/ContactSection';

function App() {
  const [alumnos, setAlumnos] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const data = loadAlumnos();
    setAlumnos(data);
  }, []);

  function toggleFavorito(id) {
    setAlumnos(prev =>
      prev.map(alumno =>
        alumno.id === id ? { ...alumno, favorito: !alumno.favorito } : alumno
      )
    );
  }

  const filtrados = alumnos.filter(a => includesContacto(a, search));
  const favoritos = filtrados.filter(a => a.favorito).sort(cmpNombre);
  const otros = filtrados.filter(a => !a.favorito).sort(cmpNombre);

  return (
    <div className="app">
      <Topbar search={search} setSearch={setSearch} />
      {filtrados.length === 0 ? (
        <p style={{ padding: '2rem' }}>No se encontraron resultados.</p>
      ) : (
        <>
          <ContactSection title="Favoritos" contacts={favoritos} toggleFavorito={toggleFavorito} />
          <ContactSection title="Contactos" contacts={otros} toggleFavorito={toggleFavorito} />
        </>
      )}
    </div>
  );
}

export default App;