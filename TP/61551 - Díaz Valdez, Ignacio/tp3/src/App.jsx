import React, { useEffect, useState } from 'react';
import './App.css';
import alumnosVcf from '../public/alumnos.vcf?raw';
import { leerAlumnosVcf } from './services/alumnos';
import { cmpNombre, incluye } from './utils/text';

function App() {
  const [alumnos, setAlumnos] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    setAlumnos(leerAlumnosVcf(alumnosVcf));
  }, []);

  function cambiarFavorito(id) {
    setAlumnos(alumnos.map(a =>
      a.id === id ? { ...a, favorito: !a.favorito } : a
    ));
  }

  const filtrados = alumnos.filter(a => incluye(a, busqueda));
  const favoritos = filtrados.filter(a => a.favorito).sort(cmpNombre);
  const otros = filtrados.filter(a => !a.favorito).sort(cmpNombre);

  return (
    <div className="main-container">
      <h2>Alumnos Programación 4</h2>
      <input
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        placeholder="Buscar por nombre, teléfono o legajo"
        type="text"
      />
      <Seccion titulo="Favoritos" lista={favoritos} cambiarFavorito={cambiarFavorito} />
      <Seccion titulo="Contactos" lista={otros} cambiarFavorito={cambiarFavorito} />
      {filtrados.length === 0 && <p>No hay resultados.</p>}
    </div>
  );
}

function Seccion({ titulo, lista, cambiarFavorito }) {
  if (lista.length === 0) return null;
  return (
    <div>
      <h3>{titulo} <span style={{color:'#888', fontWeight:'normal'}}>({lista.length})</span></h3>
      <div className="cards-grid">
        {lista.map(a =>
          <Tarjeta key={a.id} alumno={a} cambiarFavorito={cambiarFavorito} />
        )}
      </div>
    </div>
  );
}

function Tarjeta({ alumno, cambiarFavorito }) {
  let avatar;
  if (alumno.github) {
    avatar = <img className="avatar" src={`https://github.com/${alumno.github}.png?size=100`} alt="avatar" />;
  } else {
    const ini = alumno.nombre.split(' ').map(x => x[0]).join('').toUpperCase();
    avatar = <div className="avatar">{ini}</div>;
  }
  return (
    <div className="card">
      {avatar}
      <div className="card-info">
        <b>{alumno.nombre}</b>
        <div>Tel: {alumno.telefono}</div>
        <div>Legajo: {alumno.legajo}</div>
        {alumno.github && <div>GitHub: {alumno.github}</div>}
      </div>
      <button
        className={`fav-btn${alumno.favorito ? '' : ' not-fav'}`}
        onClick={() => cambiarFavorito(alumno.id)}
        title="Favorito"
      >
        {alumno.favorito ? '★' : '☆'}
      </button>
    </div>
  );
}

export default App;
