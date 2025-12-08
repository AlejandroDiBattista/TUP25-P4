

import alumnosVcf from '../../public/alumnos.vcf?raw';


export function parseVcf(vcfText) {
  const tarjetas = vcfText.split('END:VCARD');
  const alumnos = tarjetas.map(card => {
    const nombre   = card.match(/FN:(.+)/)?.[1]?.trim() || '';
    const telefono = card.match(/TEL;TYPE=CELL:(.+)/)?.[1]?.trim() || '';
    const note     = card.match(/NOTE:(.+)/)?.[1] || '';
    const legajo   = note.match(/Legajo:\s*(\d+)/)?.[1] || '';
    const github   = note.match(/Github:\s*(\w+)/)?.[1] || '';

    if (!legajo || !nombre) return null;
    return {
      id:       legajo,
      nombre,
      telefono,
      legajo,
      github,
      favorito: false
    };
  });

  return alumnos.filter(Boolean);
}

export function loadAlumnos() {
  return Promise.resolve(parseVcf(alumnosVcf));
}