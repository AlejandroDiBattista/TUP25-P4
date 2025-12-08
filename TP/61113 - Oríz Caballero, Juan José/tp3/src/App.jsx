import React from "react";
import { useEffect, useMemo, useState } from "react";
import { loadAlumnos } from "./services/alumnos";
import { cmpNombre, includesContacto } from "./utils/text";
import "./App.css";

export default function App() {
  const [alumnos, setAlumnos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await loadAlumnos();
        setAlumnos(data);
      } catch (e) {
        console.error(e);
        setError(String(e.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtrados = useMemo(
    () => alumnos.filter((a) => includesContacto(a, busqueda)),
    [alumnos, busqueda]
  );
  const favoritos = useMemo(
    () => filtrados.filter((a) => a.favorito).sort(cmpNombre),
    [filtrados]
  );
  const otros = useMemo(
    () => filtrados.filter((a) => !a.favorito).sort(cmpNombre),
    [filtrados]
  );

  const toggleFavorito = (id) => {
    setAlumnos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, favorito: !a.favorito } : a))
    );
  };

  return (
    <div className="container" style={{ color: "#eaeaea" }}>
      <header style={{ padding: "16px 0" }}>
        <h1 style={{ margin: 0 }}>Directorio de Alumnos</h1>

        {/* 👇 Nuevo contenedor con la lupa */}
        <div className="search" style={{ marginTop: 12 }}>
          <span className="search-icon" aria-hidden="true">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
</span>

          <input
            type="search"
            placeholder="Buscar por nombre, teléfono o legajo…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar"
            style={{ width: "100%" }}  // el padding-left lo da el CSS
          />
        </div>
      </header>

      {loading && <p>⏳ Cargando alumnos…</p>}
      {!!error && (
        <p style={{ color: "#ff8c8c" }}>
          ⚠️ Error: {error} — ¿existe <code>/public/alumnos.vcf</code>?
        </p>
      )}
      {!loading && !error && alumnos.length === 0 && (
        <p>ℹ️ No hay alumnos en el archivo.</p>
      )}
      {!loading && !error && filtrados.length === 0 && alumnos.length > 0 && (
        <p>🔍 No hay coincidencias con “{busqueda}”.</p>
      )}

      {!loading && !error && filtrados.length > 0 && (
        <>
          {favoritos.length > 0 && (
            <Section
              title={`Favoritos (${favoritos.length})`}
              items={favoritos}
              onToggleFavorito={toggleFavorito}
            />
          )}
          <Section
            title={`Todos (${otros.length})`}
            items={otros}
            onToggleFavorito={toggleFavorito}
          />
          <p style={{ opacity: 0.6, marginTop: 24 }}>
            Total cargados: {alumnos.length}
          </p>
        </>
      )}
    </div>
  );
}

function Section({ title, items, onToggleFavorito }) {
  return (
    <section style={{ marginTop: 16 }}>
      <h2 style={{ margin: "8px 0" }}>{title}</h2>
      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
        {items.map((a) => (
          <li key={a.id}>
            <Card alumno={a} onToggleFavorito={onToggleFavorito} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function Card({ alumno, onToggleFavorito }) {
  const { nombre, telefono, legajo, github, favorito, id } = alumno;
  const avatar = github ? `https://github.com/${github}.png?size=100` : null;

  return (
    <article
      style={{
        border: "1px solid #333",
        borderRadius: 12,
        padding: 12,
        background: "#1f2330",
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 999,
            background: "#2b3142",
            display: "grid",
            placeItems: "center",
            overflow: "hidden",
          }}
        >
          {avatar ? (
            <img
              src={avatar}
              alt={`Avatar de ${github}`}
              width={48}
              height={48}
            />
          ) : (
            <div style={{ fontWeight: 700 }}>{initials(nombre)}</div>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{nombre}</div>
          <div style={{ opacity: 0.8, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span>{telefono || "—"}</span>
            <span>Legajo: {legajo}</span>
            {github && (
              <a
                href={`https://github.com/${github}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#72b4ff" }}
              >
                @{github}
              </a>
            )}
          </div>
        </div>

        <button
          onClick={() => onToggleFavorito(id)}
          aria-pressed={favorito}
          title={favorito ? "Quitar de favoritos" : "Agregar a favoritos"}
          style={{
            background: "none",
            border: "none",
            fontSize: 22,
            cursor: "pointer",
            color: favorito ? "#ffd700" : "#9aa3b2",
          }}
        >
          {favorito ? "★" : "☆"}
        </button>
      </div>
    </article>
  );
}

function initials(name) {
  const parts = String(name ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return (parts[0]?.[0] ?? "?").toUpperCase() + (parts[1]?.[0] ?? "").toUpperCase();
}
