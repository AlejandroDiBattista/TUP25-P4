import React, { useEffect, useState } from "react";
import "./Style.css";
import alumnosVcf from "../public/alumnos.vcf?raw";

import Topbar from "./components/Topbar";
import ContactSection from "./components/ContactSection";

function parseVcf(vcfText) {
  const cards = vcfText.split("END:VCARD");
  return cards
    .map((card) => {
      const nombre = card.match(/FN:(.*)/)?.[1]?.trim() || "";
      const telefono = card.match(/TEL;TYPE=CELL:(.*)/)?.[1]?.trim() || "";
      const note = card.match(/NOTE:(.*)/)?.[1]?.trim() || "";
      const legajo = note.match(/Legajo:\s*([0-9]+)/)?.[1] || "";
      const github = note.match(/Github:\s*([^\s]+)/)?.[1] || "";

      if (!nombre) return null;

      return {
        id: legajo,
        nombre,
        telefono,
        legajo,
        github,
        favorito: false,
      };
    })
    .filter(Boolean);
}

function loadAlumnos() {
  return parseVcf(alumnosVcf);
}

function App() {
  const [alumnos, setAlumnos] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setAlumnos(loadAlumnos());
  }, []);

  const toggleFavorito = (id) => {
    setAlumnos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, favorito: !a.favorito } : a))
    );
  };

  const norm = (s) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filtrados = alumnos.filter(
    (a) =>
      norm(a.nombre).includes(norm(search)) ||
      norm(a.telefono).includes(norm(search)) ||
      norm(a.legajo).includes(norm(search))
  );

  const favoritos = filtrados
    .filter((a) => a.favorito)
    .sort((a, b) => norm(a.nombre).localeCompare(norm(b.nombre)));

  const noFavoritos = filtrados
    .filter((a) => !a.favorito)
    .sort((a, b) => norm(a.nombre).localeCompare(norm(b.nombre)));

  return (
    <div>
      <Topbar search={search} setSearch={setSearch} />
      <ContactSection
        title="Favoritos"
        contacts={favoritos}
        onToggleFavorito={toggleFavorito}
      />
      <ContactSection
        title="Contactos"
        contacts={noFavoritos}
        onToggleFavorito={toggleFavorito}
      />
    </div>
  );
}

export default App;
