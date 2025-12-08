import alumnosVcf from '../../alumnos.vcf?raw';

export function parseVcf(vcfText) {
  return vcfText
    .split('END:VCARD')
    .filter(Boolean)
    .map(card => {
      const nombre = (card.match(/FN:(.+)/) || [])[1]?.trim() || '';
      const telefono = (card.match(/TEL;TYPE=CELL:(.+)/) || [])[1]?.trim() || '';
      const note = (card.match(/NOTE:(.+)/) || [])[1]?.trim() || '';
      const legajo = (note.match(/Legajo:\s*(\d+)/i) || [])[1] || '';
      const github = (note.match(/Github:\s*([a-zA-Z0-9-]+)/i) || [])[1] || '';
      return {
        id: legajo,
        nombre,
        telefono,
        legajo,
        github,
        favorito: false,
      };
    })
    .filter(a => a.id);
}

export function loadAlumnos() {
  return parseVcf(alumnosVcf);
}