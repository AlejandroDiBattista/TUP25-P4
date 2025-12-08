import React, { useState } from "react";
import { loadAlumnos } from "./services/alumnos";
import { cmpNombre, includesContacto } from "./utils/text";

function Avatar({ nombre, github }) {
  if (github) {
    return (
      <img
        src={`https://github.com/${github}.png?size=100`}
        alt={nombre}
        width={64}
        height={64}
        style={{
          borderRadius: "50%",
          border: "none",
          background: "#fff",
          boxShadow: "0 2px 8px #0008",
          objectFit: "cover"
        }}
      />
    );
  }
  const iniciales = nombre
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  return (
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #222 60%, #444 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: 26,
        border: "none",
        color: "#fff",
        boxShadow: "0 2px 8px #0008"
      }}
    >
      {iniciales}
    </div>
  );
}

function ContactCard({ alumno, onToggleFavorito }) {
  return (
    <article
      className="card"
      style={{
        width: "100%",
        maxWidth: 520,
        minWidth: 320,
        minHeight: 120,
        margin: "0 auto 2rem auto",
        boxShadow: "0 4px 24px #0008",
        border: "none",
        borderRadius: 18,
        padding: "1.2rem 1.5rem",
        background: "linear-gradient(135deg, #fff 70%, #222 100%)",
        display: "flex",
        alignItems: "center",
        gap: 22
      }}
    >
      <Avatar nombre={alumno.nombre} github={alumno.github} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{alumno.nombre}</h3>
        <p style={{ margin: 0, color: '#444', fontSize: 15, fontWeight: 500 }}>Tel: <span style={{ color: '#111' }}>{alumno.telefono}</span></p>
        <p style={{ margin: 0, color: '#444', fontSize: 15, fontWeight: 500 }}>Legajo: <span style={{ color: '#111' }}>{alumno.legajo}</span></p>
      </div>
      <button
        onClick={() => onToggleFavorito(alumno.id)}
        aria-label="Favorito"
        className={alumno.favorito ? "contrast" : "outline"}
        style={{
          fontSize: 50,
          borderRadius: "50%",
          width: 70,
          height: 70,
          border: 0,
          background: alumno.favorito ? "#fffbe6" : "#222",
          color: alumno.favorito ? "#f5b301" : "#fff",
          boxShadow: alumno.favorito ? "0 0 0 2px #f5b30133" : "none",
          transition: "color .2s, box-shadow .2s, background .2s"
        }}
      >
        {alumno.favorito ? "★" : "☆"}
      </button>
    </article>
  );
}

function ContactSection({ title, contacts, onToggleFavorito }) {
  if (contacts.length === 0) return null;
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ marginBottom: 22, fontWeight: 800, color: '#fff', letterSpacing: '.01em', fontSize: 22, textShadow: '0 2px 8px #0008' }}>{title}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 0, alignItems: 'center' }}>
        {contacts.map((alumno) => (
          <ContactCard
            key={alumno.id}
            alumno={alumno}
            onToggleFavorito={onToggleFavorito}
          />
        ))}
      </div>
    </section>
  );
}

function Topbar({ value, onChange }) {
  return (
    <header style={{ margin: "2.5rem auto 2.5rem auto", maxWidth: 520, textAlign: "center" }}>
      <h1 style={{
        marginBottom: 22,
        fontWeight: 900,
        fontSize: 32,
        letterSpacing: ".01em",
        color: "#fff",
        textShadow: "0 2px 16px #000a"
      }}>
        Directorio de Alumnos
      </h1>
      <input
        type="text"
        placeholder="Buscar por nombre, teléfono o legajo"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
        style={{
          width: "100%",
          fontSize: 18,
          borderRadius: 12,
          border: "1.5px solid #222",
          boxShadow: "0 2px 8px #0008",
          padding: "0.8rem 1.1rem",
          background: "#111",
          color: "#fff"
        }}
      />
    </header>
  );
}

const alumnosInicial = loadAlumnos();

function App() {
  const [alumnos, setAlumnos] = useState(alumnosInicial);
  const [busqueda, setBusqueda] = useState("");

  const filtrados = alumnos.filter((alumno) => includesContacto(alumno, busqueda));
  const favoritos = filtrados.filter((a) => a.favorito).sort(cmpNombre);
  const otros = filtrados.filter((a) => !a.favorito).sort(cmpNombre);

  function toggleFavorito(id) {
    setAlumnos((alumnos) =>
      alumnos.map((a) =>
        a.id === id ? { ...a, favorito: !a.favorito } : a
      )
    );
  }

  return (
    <main style={{ minHeight: "100vh"}}>
      <Topbar value={busqueda} onChange={setBusqueda} />
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 1.2rem" }}>
        {filtrados.length === 0 ? (
          <article className="card" style={{ textAlign: "center", color: "#fff", padding: 40, marginTop: 48, fontSize: 20, background: "#222", borderRadius: 16, boxShadow: "0 2px 12px #000a" }}>
            No hay resultados.
          </article>
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
    </main>
  );
}

export default App;
