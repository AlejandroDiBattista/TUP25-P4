import React, { useState } from "react";
import { loadAlumnos } from "./services/alumnos";
import { cmpNombre, includesContacto } from "./utils/text";

function Navbar({ value, onChange }) {
  return (
    <nav className="navbar">
      <div className="navbar-title">Programación IV - Comisión 1</div>
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
              {/* Icono de libro/libreta */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#607d8b">
                <rect x="4" y="3" width="16" height="18" rx="2" fill="#e3f2fd" stroke="#607d8b" strokeWidth="2"/>
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
      {/* Estilos embebidos personalizados */}
      <style>{`
        body {
          background: #eaf1fb;
          font-family: 'Roboto', Arial, sans-serif;
          margin: 0;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #1565c0;
          padding: 1rem 2rem;
          border-radius: 0.7rem;
          margin-bottom: 2rem;
        }
        .navbar-title {
          color: #fff;
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: 1px;
        }
        .navbar-search {
          font-size: 1rem;
          padding: 0.5rem 1rem;
          border-radius: 1.5rem;
          border: 1px solid #90caf9;
          outline: none;
          width: 300px;
          background: #fff;
        }
        .section-title {
          font-size: 1.15rem;
          color: #1565c0;
          margin: 1.2rem 0 0.5rem 0;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .count {
          font-size: 1rem;
          color: #6b7280;
          font-weight: 400;
        }
        .card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.2rem;
        }
        .card {
          background: #f7fbff;
          border-radius: 1rem;
          box-shadow: 0 2px 8px #0001;
          border: 2px solid #1565c0;
          padding: 1rem 1.2rem 0.8rem 1.2rem;
          display: flex;
          align-items: flex-start;
          position: relative;
          min-height: 120px;
        }
        .card-avatar {
          margin-right: 1rem;
          flex-shrink: 0;
        }
        .avatar {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #90caf9;
          background: #e3f2fd;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          font-weight: 700;
          color: #1565c0;
        }
        .avatar-alt {
          background: #bbdefb;
          color: #1565c0;
        }
        .card-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .card-nombre {
          font-size: 1.15rem;
          font-weight: 700;
          color: #0d47a1;
          margin-bottom: 0.4rem;
          font-family: 'Montserrat', Arial, sans-serif;
          letter-spacing: 0.5px;
        }
        .card-datos {
          font-size: 0.97rem;
          color: #607d8b;
          margin-bottom: 0.2rem;
          font-family: 'Roboto Mono', monospace;
        }
        .dato {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          margin-bottom: 0.15rem;
        }
        .dato-label {
          color: #607d8b;
          font-weight: 500;
        }
        .dato-value {
          color: #263238;
          font-weight: 600;
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
          transition: transform 0.1s;
        }
        .fav-btn:hover {
          transform: scale(1.15);
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
          color: #6b7280;
          font-size: 1.2rem;
        }
      `}</style>
    </div>
  );
}