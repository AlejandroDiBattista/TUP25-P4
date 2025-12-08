
import React, { useState, useEffect } from 'react';
import Topbar from './components/Topbar';
import ContactSection from './components/ContactSection';
import { cmpNombre, includesContacto} from './utils/text.js';
import { loadAlumnos } from './services/alumnos.js';

export default function App() {
  const [alumnos, setAlumnos] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    loadAlumnos().then(setAlumnos);
  }, []);

  const toggleFavorito = id => {
    setAlumnos(prev =>
      prev.map(a =>
        a.id === id ? { ...a, favorito: !a.favorito } : a
      )
    );
  };

  const filtrados = alumnos.filter(a => includesContacto(a, busqueda));
  const favoritos = filtrados
    .filter(a => a.favorito)
    .sort(cmpNombre);
  const otros = filtrados
    .filter(a => !a.favorito)
    .sort(cmpNombre);

  return (
    <main className="container">
      <Topbar
        busqueda={busqueda}
        setBusqueda={setBusqueda}
      />
      <ContactSection
        title="⭐ Favoritos"
        contacts={favoritos}
        onToggle={toggleFavorito}
      />
      <ContactSection
        title="📋 Contactos"
        contacts={otros}
        onToggle={toggleFavorito}
      />
      {filtrados.length === 0 && (
        <p>No se encontraron coincidencias.</p>
      )}
    </main>
  );
}