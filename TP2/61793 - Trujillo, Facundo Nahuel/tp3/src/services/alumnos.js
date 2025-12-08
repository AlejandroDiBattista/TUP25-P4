// src/services/alumnos.js

// función que parsea el contenido del .vcf
const parseVcf = (text) => {
  const entries = text.split(/END:VCARD/i).map(s => s.trim()).filter(Boolean);
  const alumnos = entries.map(block => {
    const idMatch = block.match(/FN:(.+)/i);
    const fn = idMatch ? idMatch[1].trim() : '';

    const telMatch = block.match(/TEL[^:]*:(.+)/i);
    const telefono = telMatch ? telMatch[1].trim() : '';

    const noteMatch = block.match(/NOTE:(.+)/i);
    const note = noteMatch ? noteMatch[1].trim() : '';

    const legajoMatch = note ? note.match(/Legajo[:\s]*([0-9]+)/i) : null;
    const legajo = legajoMatch ? legajoMatch[1] : '';

    const ghMatch = note ? note.match(/Github[:\s]*\(?([a-z0-9-_.]+)\)?/i) : null;
    const github = ghMatch ? ghMatch[1] : '';

    const id = legajo || fn.replace(/\s+/g, '_').toLowerCase();

    return {
      id,
      nombre: fn,
      telefono,
      legajo,
      github,
      favorito: false,
    };
  });

  return alumnos.filter(a => a.nombre && (a.telefono || a.legajo || a.github));
};

// carga el archivo desde /public/alumnos.vcf
export const loadAlumnos = async () => {
  const response = await fetch('/alumnos.vcf');
  if (!response.ok) throw new Error('No se pudo cargar alumnos.vcf');
  const text = await response.text();
  return parseVcf(text);
};
