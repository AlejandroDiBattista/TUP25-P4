import './App.css';
import React, { useEffect, useState } from 'react';
import { loadAlumnos } from './services/alumnos';
import { norm, cmpNombre, includesContacto } from './utils/text';
import Topbar from './components/Topbar';
import ContactSection from './components/ContactSection';

function App() {
  const [alumnos, setAlumnos] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    loadAlumnos().then(setAlumnos);
  }, []);

  // Alternar favorito
  const toggleFav = (id) => {
    setAlumnos(alumnos => alumnos.map(a =>
      a.id === id ? { ...a, favorito: !a.favorito } : a
    ));
  };

  // Filtrar y agrupar
  const filtro = norm(busqueda);
  const filtrados = alumnos.filter(a => includesContacto(a, filtro));
  const favoritos = filtrados.filter(a => a.favorito).sort(cmpNombre);
  const noFavoritos = filtrados.filter(a => !a.favorito).sort(cmpNombre);

  return (
    <div>
      <Topbar value={busqueda} onChange={setBusqueda} />
      {filtrados.length === 0 ? (
        <p style={{textAlign: 'center', marginTop: '2em'}}>No se encontraron alumnos.</p>
      ) : (
        <>
          <ContactSection title="Favoritos" contacts={favoritos} onToggleFav={toggleFav} />
          <ContactSection title="Otros" contacts={noFavoritos} onToggleFav={toggleFav} />
        </>
      )}
    </div>
  );
}

export default App;
