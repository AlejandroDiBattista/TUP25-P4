
import React, { useState, useEffect } from 'react';
import { loadAlumnos } from './services/alumnos';
import { cmpNombre, includesContacto } from './utils/text';
import Topbar from './components/Topbar';
import ContactSection from './components/ContactSection';

export default function App() {
  const [alumnos, setAlumnos] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let mounted = true;
    loadAlumnos()
      .then(data => { if (mounted) setAlumnos(data); })
      .catch(err => console.error(err));
    return () => { mounted = false; };
  }, []);

  const visibles = alumnos.filter((a) => includesContacto(a, query));
  const favoritos = visibles.filter((a) => a.favorito).sort((a, b) => cmpNombre(a.nombre, b.nombre));
  const resto = visibles.filter((a) => !a.favorito).sort((a, b) => cmpNombre(a.nombre, b.nombre));

  const handleToggleFavorito = (id) => {
    setAlumnos((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, favorito: !a.favorito } : a
      )
    );
  };

  return (
    <div>
      <Topbar value={query} onChange={setQuery} />
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
