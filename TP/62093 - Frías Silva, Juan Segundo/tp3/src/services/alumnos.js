// src/services/alumnos.js
import alumnosVcf from "../alumnos.vcf?raw";

export function parseVcf(text) {
  const cards = text.split('END:VCARD').map(c => c.trim()).filter(c => c);

  return cards.map(card => {
    const nombreMatch = card.match(/FN:(.+)/);
    const telefonoMatch = card.match(/TEL;TYPE=CELL:(.+)/);
    const noteMatch = card.match(/NOTE:(.+)/);

    const nombre = nombreMatch ? nombreMatch[1].trim() : '';
    const telefono = telefonoMatch ? telefonoMatch[1].trim() : '';
    const note = noteMatch ? noteMatch[1].trim() : '';

    // Extraer Legajo y Github desde NOTE
    let legajo = '';
    let github = '';
    if (note) {
      const legajoMatch = note.match(/Legajo:\s*(\d+)/i);
      const githubMatch = note.match(/Github:\s*([A-Za-z0-9-]+)/i);
      legajo = legajoMatch ? legajoMatch[1] : '';
      github = githubMatch ? githubMatch[1] : '';
    }

    return {
      id: legajo,
      nombre,
      telefono,
      legajo,
      github,
      favorito: false
    };
  });
}

export function loadAlumnos() {
  return parseVcf(alumnosVcf);
}
