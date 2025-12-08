import alumnosVcf from './alumnos.vcf?raw';

export function parseVcf(vcf) {
  return vcf
    .split('BEGIN:VCARD')
    .map(card => card.trim())
    .filter(card => card)
    .map(card => {
      const nombre = (card.match(/FN:(.+)/) || [])[1]?.trim() || '';
      const telefono = (card.match(/TEL;TYPE=CELL:(.+)/) || [])[1]?.trim() || '';
      const note = (card.match(/NOTE:(.+)/) || [])[1]?.trim() || '';
      const legajo = (note.match(/Legajo: (\d+)/) || [])[1] || '';
      const github = (note.match(/Github: ([\w-]+)/i) || [])[1] || '';
      return {
        id: legajo,
        nombre,
        telefono,
        legajo,
        github,
        favorito: false,
      };
    });
}

export function loadAlumnos() {
  return parseVcf(alumnosVcf);
}