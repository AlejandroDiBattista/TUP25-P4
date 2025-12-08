
import React, { useEffect, useState } from 'react';
import { loadAlumnos } from './services/alumnos';
import { cmpNombre, includesContacto } from './utils/text';
import Topbar from './components/Topbar';
import ContactSection from './components/ContactSection';
import './styles/app.css';

export default function App() {
  const [alumnos, setAlumnos] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadAlumnos().then(setAlumnos);
  }, []);

  const toggleFavorito = id => {
    setAlumnos(prev => prev.map(a => a.id === id ? { ...a, favorito: !a.favorito } : a));
  };

  const filtered = alumnos.filter(a =>
    includesContacto(a.nombre, search) ||
    includesContacto(a.telefono, search) ||
    includesContacto(a.legajo, search)
  );

  const favoritos = filtered.filter(a => a.favorito).sort(cmpNombre);
  const noFavoritos = filtered.filter(a => !a.favorito).sort(cmpNombre);

  return (
    <div>
      <Topbar search={search} setSearch={setSearch} />
      {favoritos.length > 0 && (
        <ContactSection title="Favoritos" contacts={favoritos} toggleFavorito={toggleFavorito} />
      )}
      <ContactSection title="Contactos" contacts={noFavoritos} toggleFavorito={toggleFavorito} />
      {filtered.length === 0 && <p className="empty-msg">No se encontraron resultados.</p>}
    </div>
  );
}
