import { norm } from '../utils/text';

export function parseVcf(vcf) {
  const tarjetas = vcf.split('END:VCARD');
  return tarjetas
    .map(card => {
      const fn = /FN:(.+)/.exec(card)?.[1]?.trim();
      const tel = /TEL;TYPE=CELL:(.+)/.exec(card)?.[1]?.trim();
      const note = /NOTE:(.+)/.exec(card)?.[1]?.trim();
      if (!fn || !tel || !note) return null;
      const legajo = /Legajo:\s*(\d+)/i.exec(note)?.[1] || '';
      const github = /Github:\s*([A-Za-z0-9-]+)/i.exec(note)?.[1] || '';
      return {
        id: legajo,
        nombre: fn,
        telefono: tel,
        legajo,
        github,
        favorito: false,
      };
    })
    .filter(Boolean);
}

export async function loadAlumnos() {
  const resp = await fetch('/alumnos.vcf');
  const vcf = await resp.text();
  return parseVcf(vcf);
}