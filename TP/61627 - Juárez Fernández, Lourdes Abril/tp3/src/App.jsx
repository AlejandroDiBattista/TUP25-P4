
import React, { useState } from 'react';
import { loadAlumnos } from './services/alumnos';
import { norm, cmpNombre, includesContacto } from './utils/text';
import './App.css';
import './App.css';

function Topbar({ value, onChange }) {
  return (
    <header>
      <h1>Directorio de Alumnos</h1>
      <input
        type="text"
        placeholder="Buscar por nombre, teléfono o legajo..."
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </header>
  );
}

function ContactCard({ alumno, onFav }) {
  const avatar = alumno.github
    ? <img className="contact-avatar" src={`https://github.com/${alumno.github}.png?size=100`} alt={alumno.nombre} />
    : <div className="contact-avatar">{alumno.nombre.split(' ').map(x => x[0]).join('').toUpperCase()}</div>;
  return (
    <article className="contact-card">
      {avatar}
      <div className="contact-info">
        <div className="nombre">{alumno.nombre}</div>
        <div className="detalle">📞 {alumno.telefono} | Legajo: {alumno.legajo}</div>
        {alumno.github && <div className="github">🐙 {alumno.github}</div>}
      </div>
      <button onClick={onFav} className={alumno.favorito ? 'fav-btn fav' : 'fav-btn'} title="Favorito">
        {alumno.favorito ? '★' : '☆'}
      </button>
    </article>
  );
}

function ContactSection({ title, contacts, onFav }) {
  return (
    <section>
      <h2>{title} <span className="section-count">({contacts.length})</span></h2>
      <div className="cards-grid">
        {contacts.length === 0 ? (
          <div className="empty-msg">Sin datos</div>
        ) : (
          contacts.map(alumno => (
            <ContactCard key={alumno.id} alumno={alumno} onFav={() => onFav(alumno.id)} />
          ))
        )}
      </div>
    </section>
  );
}

export default function App() {
  const [alumnos, setAlumnos] = useState(loadAlumnos());
  const [busqueda, setBusqueda] = useState('');

  // Filtrado y orden
  const filtrados = alumnos.filter(a => includesContacto(a, busqueda));
  const favoritos = filtrados.filter(a => a.favorito).sort(cmpNombre);
  const noFavoritos = filtrados.filter(a => !a.favorito).sort(cmpNombre);
  const sinDatos = alumnos.length === 0;

  function toggleFav(id) {
    setAlumnos(alumnos => alumnos.map(a => a.id === id ? { ...a, favorito: !a.favorito } : a));
  }

  return (
    <div className="app-container">
      <Topbar value={busqueda} onChange={setBusqueda} />
      <ContactSection title="Favoritos" contacts={favoritos} onFav={toggleFav} />
      <ContactSection title="Otros" contacts={noFavoritos} onFav={toggleFav} />
      {filtrados.length === 0 && (
        <ContactSection title="Sin resultados" contacts={[]} onFav={() => {}} />
      )}
    </div>
  );
}

