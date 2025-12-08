
import React, { useState, useEffect } from 'react';
import { parseVcf } from './services/alumnos';
import { cmpNombre, includesContacto } from './utils/text';
import Topbar from './components/Topbar';
import ContactSection from './components/ContactSection';

export default function App() {
  const [alumnos, setAlumnos] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVcf() {
      try {
        const response = await fetch('/alumnos.vcf');
        const text = await response.text();
        console.log('VCF text:', text);
        const alumnos = parseVcf(text);
        console.log('Alumnos parseados:', alumnos);
        setAlumnos(alumnos);
      } catch (e) {
        console.error('Error al cargar VCF:', e);
        setAlumnos([]);
      } finally {
        setLoading(false);
      }
    }
    fetchVcf();
  }, []);

  function handleToggleFavorito(id) {
    setAlumnos(alumnos =>
      alumnos.map(a =>
        a.id === id ? { ...a, favorito: !a.favorito } : a
      )
    );
  }

  const filtrados = alumnos.filter(a => includesContacto(a, query));
  const favoritos = filtrados.filter(a => a.favorito).sort(cmpNombre);
  const noFavoritos = filtrados.filter(a => !a.favorito).sort(cmpNombre);

  return (
    <div className="app">
      <Topbar value={query} onChange={setQuery} />
      {loading ? (
        <div className="empty">Cargando alumnos...</div>
      ) : filtrados.length === 0 ? (
        <div className="empty">No se encontraron alumnos.</div>
      ) : (
        <>
          <ContactSection
            title="Favoritos"
            contacts={favoritos}
            onToggleFavorito={handleToggleFavorito}
          />
          <ContactSection
            title="Contactos"
            contacts={noFavoritos}
            onToggleFavorito={handleToggleFavorito}
          />
        </>
      )}
    </div>
  );
}