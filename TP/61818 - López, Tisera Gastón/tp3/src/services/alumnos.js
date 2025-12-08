import { norm } from '../utils/text.js'

// Parsea el contenido VCF (vCard 3.0) y devuelve array de alumnos
export function parseVcf(text) {
  if (!text) return [];
  // Separamos por bloques BEGIN:VCARD ... END:VCARD
  const blocks = text.split(/BEGIN:VCARD[\s\S]*?VERSION:3\.0/i).join('').split(/END:VCARD/i);
  // Alternativamente, busquemos de forma más robusta por grupos usando regex global
  const regex = /BEGIN:VCARD\s+VERSION:3\.0\s+([\s\S]*?)END:VCARD/gm;
  const alumnos = [];
  let m;
  while ((m = regex.exec(text)) !== null) {
    const body = m[1];
    const line = (re) => (body.match(re)?.[1] ?? '').trim();
    const fn = line(/\bFN:([^\n\r]+)/i);
    const tel = line(/\bTEL;TYPE=CELL:([^\n\r]+)/i);
    const note = line(/\bNOTE:([^\n\r]+)/i);

    // Extraer legajo y github del NOTE
    let legajo = '';
    let github = '';
    if (note) {
      const leg = note.match(/Legajo:\s*(\d+)/i);
      if (leg) legajo = leg[1];
      const gh = note.match(/Github:\s*([A-Za-z0-9-]+)/i);
      if (gh) github = gh[1];
    }

    if (fn || tel || legajo) {
      alumnos.push({
        id: legajo || norm(fn),
        nombre: fn,
        telefono: tel,
        legajo,
        github: github || '',
        favorito: false,
      });
    }
  }
  return alumnos;
}

export async function loadAlumnos() {
  const res = await fetch('/alumnos.vcf');
  const text = await res.text();
  return parseVcf(text);
}
