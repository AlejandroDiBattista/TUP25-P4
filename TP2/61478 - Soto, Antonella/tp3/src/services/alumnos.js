// src/services/alumnos.js
import alumnosVcf from './alumnos.vcf?raw';

// Parsea el VCF y devuelve los objetos alumno
export function parseVcf(vcfText) {
  const cards = vcfText.split('END:VCARD').map(c => c.trim()).filter(Boolean);

  return cards.map(card => {
    const nombreMatch = card.match(/FN:(.+)/);
    const telMatch = card.match(/TEL;TYPE=CELL:(.+)/);
    const noteMatch = card.match(/NOTE:(.+)/);

    const nombre = nombreMatch ? nombreMatch[1].trim() : '';
    const telefono = telMatch ? telMatch[1].trim() : '';
    const note = noteMatch ? noteMatch[1].trim() : '';

    let legajo = '';
    let github = '';
    if (note) {
      const legajoMatch = note.match(/Legajo:\s*(\d+)/i);
      github = noteMatch ? (noteMatch[1].match(/Github:\s*([^\s]+)/i)?.[1] ?? "") : "";
      legajo = legajoMatch ? legajoMatch[1] : '';
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