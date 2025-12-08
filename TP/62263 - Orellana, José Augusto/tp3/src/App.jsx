import React, { useEffect, useState } from 'react';
import { loadAlumnosFromPublic } from './services/alumnos';
import { includesContacto, cmpNombre} from './utils/text';
import Topbar from './components/Topbar';
import ContactSection from './components/ContactSection';

function App() {
  const [alumnos, setAlumnos] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    loadAlumnosFromPublic()
      .then((data) => setAlumnos(data))
      .catch((err) => console.error(err));
  }, []);

  const handleToggleFavorito = (id) => {
    setAlumnos((prev) => 
      prev.map((a) =>
        a.id === id ? { ...a, favorito: !a.favorito } : a
      )
    );
  };

  const visibles = alumnos.filter((a) => includesContacto(a, query));
  const favoritos = visibles.filter((a) => a.favorito).sort(cmpNombre);
  const resto = visibles.filter((a) => !a.favorito).sort(cmpNombre);


  return (
    <div>
      <Topbar query={query} setQuery={setQuery} />
      <ContactSection
        title="Favoritos"
        contacts={favoritos}
        onToggleFavorito={handleToggleFavorito}
      />
      <ContactSection
        title="Contactos"
        contacts={resto}
        onToggleFavorito={handleToggleFavorito}
      />
    </div>
  );
}

export default App;