import React, { useEffect, useState, useMemo } from 'react';
import { loadAlumnos } from './services/alumnos';
import { norm, cmpNombre, includesContacto } from './utils/text';
import Topbar from './componentes/TopBar';
import ContactSection from './componentes/ContactSection';
import './index.css';
function App() {

   const [alumnos, setAlumnos] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let mounted = true;
    loadAlumnos().then(list => {
      if (!mounted) return;
      setAlumnos(list);
    });
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = norm(query);
    const matched = alumnos.filter(a => includesContacto(a, q));

    const favoritos = matched.filter(m => m.favorito).sort(cmpNombre);
    const otros = matched.filter(m => !m.favorito).sort(cmpNombre);

    return { favoritos, otros };
  }, [alumnos, query]);

  function toggleFavorito(id) {
    setAlumnos(prev => prev.map(a => a.id === id ? { ...a, favorito: !a.favorito } : a));
  }

  return (
    <div className="app">
      <Topbar value={query} onChange={setQuery} />

      <main>
        <ContactSection  title="Favoritos" contacts={filtered.favoritos} onToggleFavorito={toggleFavorito} />
        <ContactSection  title="Otros" contacts={filtered.otros} onToggleFavorito={toggleFavorito} />

        {filtered.favoritos.length === 0 && filtered.otros.length === 0 && (
          <p className="no-results">No se encontraron alumnos que coincidan con la búsqueda.</p>
        )}
      </main>
    </div>
  );
}

export default App
