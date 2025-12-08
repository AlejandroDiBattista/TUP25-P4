
import alumnosVcf from '../../public/alumnos.vcf?raw';

// Parsea el texto VCF y devuelve un array de alumnos
export function parseVcf(vcfText) {
  const tarjetas = vcfText.split('END:VCARD');
  return tarjetas
    .map(card => {
      const nombre = (card.match(/FN:(.+)/) || [])[1]?.trim();
      const telefono = (card.match(/TEL;TYPE=CELL:(.+)/) || [])[1]?.trim();
      const note = (card.match(/NOTE:(.+)/) || [])[1]?.trim();
      if (!nombre || !telefono || !note) return null;
      const legajo = (note.match(/Legajo:\s*(\d+)/i) || [])[1];
      const github = (note.match(/Github:\s*([A-Za-z0-9-]+)/i) || [])[1] || "";
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

// Devuelve la lista de alumnos parseados
export function loadAlumnos() {
  return parseVcf(alumnosVcf);
}
