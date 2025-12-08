import React, { useState } from "react";
import { loadAlumnos } from "./services/alumnos";
import { cmpNombre, includesContacto } from "./utils/text";

function Navbar({ value, onChange }) {
  return (
    <nav className="navbar">
      <div className="navbar-title">Programación 4 - Comisión 1</div>
      <input
        type="search"
        placeholder="Buscar alumno..."
        value={value}
        onChange={e => onChange(e.target.value)}
        className="navbar-search"
      />
    </nav>
  );
}

function ContactSection({ title, contacts, onFav }) {
  if (contacts.length === 0) return null;
  return (
    <section>
      <h2 className="section-title">
        {title} <span className="count">({contacts.length})</span>
      </h2>
      <div className="card-grid">
        {contacts.map(alumno => (
          <ContactCard key={alumno.id} alumno={alumno} onFav={onFav} />
        ))}
      </div>
    </section>
  );
}

function ContactCard({ alumno, onFav }) {
  const avatar = alumno.github
    ? (
      <img
        src={`https://github.com/${alumno.github}.png?size=100`}
        alt={alumno.nombre}
        className="avatar"
      />
    ) : (
      <div className="avatar avatar-alt">
        {alumno.nombre.split(' ').map(x => x[0]).join('').slice(0,2).toUpperCase()}
      </div>
    );
  return (
    <div className="card">
      <div className="card-avatar">{avatar}</div>
      <div className="card-info">
        <div className="card-nombre">{alumno.nombre}</div>
        <div className="card-datos">
          <div className="dato">
            <span className="icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#607d8b"><path d="M6.62 10.79a15.053 15.053 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.11-.21c1.21.49 2.53.76 3.88.76a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C7.61 21 3 16.39 3 11a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.35.27 2.67.76 3.88a1 1 0 0 1-.21 1.11l-2.2 2.2z"/></svg>
            </span>
            <span className="dato-label">Tel:</span>
            <span className="dato-value">{alumno.telefono}</span>
          </div>
          <div className="dato">
            <span className="icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#607d8b">
                <rect x="4" y="3" width="16" height="18" rx="2" fill="#f5f5f5" stroke="#607d8b" strokeWidth="2"/>
                <line x1="8" y1="7" x2="16" y2="7" stroke="#607d8b" strokeWidth="1.5"/>
                <line x1="8" y1="11" x2="16" y2="11" stroke="#607d8b" strokeWidth="1.5"/>
                <line x1="8" y1="15" x2="16" y2="15" stroke="#607d8b" strokeWidth="1.5"/>
              </svg>
            </span>
            <span className="dato-label">Legajo:</span>
            <span className="dato-value">{alumno.legajo}</span>
          </div>
        </div>
      </div>
      <button
        className={`fav-btn${alumno.favorito ? " fav" : ""}`}
        title={alumno.favorito ? "Quitar de favoritos" : "Marcar como favorito"}
        onClick={() => onFav(alumno.id)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill={alumno.favorito ? "#ff9800" : "none"} stroke="#ff9800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </button>
    </div>
  );
}

export default function App() {
  const [alumnos, setAlumnos] = useState(loadAlumnos());
  const [busqueda, setBusqueda] = useState("");

  // Filtrado y agrupación
  const filtrados = Array.isArray(alumnos) ? alumnos.filter(a => includesContacto(a, busqueda)) : [];
  const favoritos = filtrados.filter(a => a.favorito).sort(cmpNombre);
  const noFavoritos = filtrados.filter(a => !a.favorito).sort(cmpNombre);

  function toggleFav(id) {
    setAlumnos(alumnos =>
      alumnos.map(a =>
        a.id === id ? { ...a, favorito: !a.favorito } : a
      )
    );
  }

  return (
    <div className="container">
      <Navbar value={busqueda} onChange={setBusqueda} />
      {filtrados.length === 0 ? (
        <div className="vacio">No se encontraron alumnos.</div>
      ) : (
        <>
          <ContactSection title="Favoritos" contacts={favoritos} onFav={toggleFav} />
          <ContactSection title="Contactos" contacts={noFavoritos} onFav={toggleFav} />
        </>
      )}
      {/* Estilos embebidos básicos y sobrios */}
      <style>{`
        body {
          background: #f5f6fa;
          font-family: Arial, sans-serif;
          margin: 0;
        }
        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #e3e7ed;
          padding: 1rem 1.5rem;
          border-radius: 0.5rem;
          margin-bottom: 2rem;
          border: 1px solid #cfd8dc;
        }
        .navbar-title {
          color: #263238;
          font-size: 1.2rem;
          font-weight: 600;
        }
        .navbar-search {
          font-size: 1rem;
          padding: 0.4rem 1rem;
          border-radius: 1.2rem;
          border: 1px solid #b0bec5;
          outline: none;
          width: 220px;
          background: #fafbfc;
          color: #263238;
        }
        .section-title {
          font-size: 1rem;
          color: #37474f;
          margin: 1.2rem 0 0.5rem 0;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .count {
          font-size: 0.95rem;
          color: #90a4ae;
          font-weight: 400;
        }
        .card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1rem;
        }
        .card {
          background: #fff;
          border-radius: 0.5rem;
          border: 1px solid #cfd8dc;
          padding: 1rem 1rem 0.8rem 1rem;
          display: flex;
          align-items: flex-start;
          position: relative;
          min-height: 90px;
        }
        .card-avatar {
          margin-right: 1rem;
          flex-shrink: 0;
        }
        .avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid #b0bec5;
          background: #eceff1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          font-weight: 700;
          color: #607d8b;
        }
        .avatar-alt {
          background: #cfd8dc;
          color: #607d8b;
        }
        .card-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .card-nombre {
          font-size: 1.05rem;
          font-weight: 600;
          color: #263238;
          margin-bottom: 0.4rem;
        }
        .card-datos {
          font-size: 0.97rem;
          color: #607d8b;
        }
        .dato {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          margin-bottom: 0.15rem;
        }
        .dato-label {
          color: #90a4ae;
          font-weight: 500;
        }
        .dato-value {
          color: #263238;
          font-weight: 500;
        }
        .icon {
          display: flex;
          align-items: center;
        }
        .fav-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.1rem;
        }
        .fav-btn svg {
          vertical-align: middle;
        }
        .fav-btn.fav svg {
          filter: drop-shadow(0 0 2px #ff9800);
        }
        .vacio {
          margin: 2rem 0;
          text-align: center;
          color: #90a4ae;
          font-size: 1.1rem;
        }
      `}</style>
    </div>
  );
}