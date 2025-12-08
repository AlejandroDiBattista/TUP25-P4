import React from "react";
import { useEffect, useState } from "react";
import { loadAlumnos } from "./services/alumnos";
import { cmpNombre, includesContacto } from "./utils/text";
import Topbar from "./components/Topbar";
import ContactSection from "./components/ContactSection";
import "./App.css"

export default function App() {
  const [alumnos, setAlumnos] = useState([]);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    loadAlumnos().then(setAlumnos);
  }, []);

  const handleFav = (id) => {
    setAlumnos((alumnos) =>
      alumnos.map((a) => (a.id === id ? { ...a, favorito: !a.favorito } : a))
    );
  };

  const filtrados = alumnos.filter((a) => includesContacto(a, filtro));
  const favoritos = filtrados.filter((a) => a.favorito).sort(cmpNombre);
  const noFavoritos = filtrados.filter((a) => !a.favorito).sort(cmpNombre);

  return (
    <div>
      <Topbar value={filtro} onChange={setFiltro} />
      {filtrados.length === 0 ? (
        <p style={{ textAlign: "center" }}>No hay alumnos para mostrar.</p>
      ) : (
        <>
          <ContactSection
            title="Favoritos"
            contacts={favoritos}
            onFav={handleFav}
          />
          <ContactSection
            title="Contactos"
            contacts={noFavoritos}
            onFav={handleFav}
          />
        </>
      )}
    </div>
  );
}
