import alumnosVcf from './alumnos.vcf?raw';

export function parseVcf(vcfText) {
  const cards = vcfText.split('END:VCARD');
  const alumnos = [];

  for (const card of cards) {
    if (!card.includes('BEGIN:VCARD')) continue;

    const nombre = (card.match(/FN:(.+)/) || [])[1]?.trim() || '';
    const telefono = (card.match(/TEL;TYPE=CELL:(.+)/) || [])[1]?.trim() || '';
    const note = (card.match(/NOTE:(.+)/) || [])[1]?.trim() || '';

    const legajoMatch = note.match(/Legajo:\s*(\d+)/i);
    const githubMatch = note.match(/Github:\s*([\w-]+)/i);

    const legajo = legajoMatch ? legajoMatch[1] : '';
    const github = githubMatch ? githubMatch[1] : '';

    if (legajo) {
      alumnos.push({
        id: legajo,
        nombre,
        telefono,
        legajo,
        github,
        favorito: false,
      });
    }
  }

  return alumnos;
}

export function loadAlumnos() {
  return parseVcf(alumnosVcf);
}
