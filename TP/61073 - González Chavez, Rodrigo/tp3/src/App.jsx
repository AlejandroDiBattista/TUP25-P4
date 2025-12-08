import React, { useEffect, useState } from "react";
import { loadAlumnos } from "./services/alumnos";
import { cmpNombre, includesContacto } from "./utils/text";
import Topbar from "./components/Topbar";
import ContactSection from "./components/ContactSection";

function App() {
  const [alumnos, setAlumnos] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    loadAlumnos().then((data) => setAlumnos(data));
  }, []);

  const toggleFavorito = (id) => {
    setAlumnos((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, favorito: !a.favorito } : a
      )
    );
  };

  const filtrados = alumnos.filter((a) => includesContacto(a, busqueda));
  const favoritos = filtrados
    .filter((a) => a.favorito)
    .sort(cmpNombre);
  const otros = filtrados
    .filter((a) => !a.favorito)
    .sort(cmpNombre);

  return (
    <div>
      <Topbar busqueda={busqueda} setBusqueda={setBusqueda} />

      <main style={{ padding: "1rem" }}>
        <ContactSection
          title="Favoritos"
          contacts={favoritos}
          toggleFavorito={toggleFavorito}
        />
        <ContactSection
          title="Contactos"
          contacts={otros}
          toggleFavorito={toggleFavorito}
        />
      </main>
    </div>
  );
}

export default App;
