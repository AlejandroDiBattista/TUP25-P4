// src/services/alumnos.js
// Asume public/alumnos.vcf disponible en runtime en /alumnos.vcf
export function parseVcf(vcfText) {
  const cardRegex = /BEGIN:VCARD([\s\S]*?)END:VCARD/g;
  const cards = [];
  let match;
  while ((match = cardRegex.exec(vcfText)) !== null) {
    const card = match[1];

    const fnMatch = card.match(/FN:(.+)/);
    const nombre = fnMatch ? fnMatch[1].trim() : '';

    const telMatch = card.match(/TEL[^:]*:(.+)/);
    const telefono = telMatch ? telMatch[1].trim() : '';

    const noteMatch = card.match(/NOTE:([\s\S]*)/);
    const note = noteMatch ? noteMatch[1].replace(/\r/g, '') : '';

    const legajoMatch = note.match(/Legajo:\s*(\d+)/i);
    const legajo = legajoMatch ? legajoMatch[1] : '';

    const githubMatch = note.match(/GitHub:\s*([A-Za-z0-9\-_\.]+)/i) || note.match(/Github:\s*([A-Za-z0-9\-_\.]+)/i);
    const github = githubMatch ? githubMatch[1] : '';

    if (nombre || legajo) {
      cards.push({ id: legajo || nombre, nombre, telefono, legajo, github, favorito: false });
    }
  }
  return cards;
}

export async function loadAlumnos() {
  try {
    const resp = await fetch('/alumnos.vcf');
    if (!resp.ok) throw new Error('No se encontró /alumnos.vcf (revisá public/)');
    const text = await resp.text();
    return parseVcf(text);
  } catch (err) {
    console.error('Error cargando alumnos.vcf:', err);
    return [];
  }
}
