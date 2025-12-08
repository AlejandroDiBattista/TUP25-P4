import alumnosVcf from '../../public/alumnos.vcf?raw';
import { norm } from '../utils/text';

export function parseVcf(vcf) {
  if (!vcf || typeof vcf !== "string") return [];
  const tarjetas = vcf.split('END:VCARD').map(x => x.trim()).filter(Boolean);
  return tarjetas.map(card => {
    const nombre = (card.match(/FN:(.+)/) || [,''])[1].trim();
    const telefono = (card.match(/TEL;TYPE=CELL:(.+)/) || [,''])[1].trim();
    const note = (card.match(/NOTE:(.+)/) || [,''])[1] || '';
    const legajo = (note.match(/Legajo:\s*(\d+)/i) || [,''])[1];
    const github = (note.match(/Github:\s*([a-zA-Z0-9-_.]+)/i) || [,''])[1] || '';
    return {
      id: legajo || nombre,
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