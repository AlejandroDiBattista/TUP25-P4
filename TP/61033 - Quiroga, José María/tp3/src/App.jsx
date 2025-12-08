import React, { useState } from 'react';
import { loadAlumnos } from './services/alumnos.js';
import { cmpNombre, includesContacto } from './utils/text.js';
import Topbar from './components/Topbar.jsx';
import ContactSection from './components/ContactSection.jsx';

const alumnosInit = loadAlumnos();

export default function App() {
  const [alumnos, setAlumnos] = useState(alumnosInit);
  const [busqueda, setBusqueda] = useState('');

  // Filtrado y orden
  const filtrados = alumnos.filter(a => includesContacto(a, busqueda));
  const favoritos = filtrados.filter(a => a.favorito).sort(cmpNombre);
  const otros = filtrados.filter(a => !a.favorito).sort(cmpNombre);

  function toggleFavorito(id) {
    setAlumnos(alumnos =>
      alumnos.map(a =>
        a.id === id ? { ...a, favorito: !a.favorito } : a
      )
    );
  }

  return (
    <div>
      <Topbar value={busqueda} onChange={setBusqueda} />
      {filtrados.length === 0 ? (
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>
          No se encontraron alumnos.
        </p>
      ) : (
        <>
          <ContactSection
            title="Favoritos"
            contacts={favoritos}
            onToggleFavorito={toggleFavorito}
          />
          <ContactSection
            title="Otros"
            contacts={otros}
            onToggleFavorito={toggleFavorito}
          />
        </>
      )}
    </div>
  );
}
