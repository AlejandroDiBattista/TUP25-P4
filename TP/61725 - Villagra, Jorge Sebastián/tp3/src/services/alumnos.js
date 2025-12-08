import alumnosVcf from '../../public/alumnos.vcf?raw';

export function parseVcf(vcfText) {
  const tarjetas = vcfText.split('END:VCARD');
  return tarjetas
    .map(card => {
      const nombre = card.match(/FN:(.+)/)?.[1]?.trim() || '';
      const telefono = card.match(/TEL;TYPE=CELL:(.+)/)?.[1]?.trim() || '';
      const note = card.match(/NOTE:(.+)/)?.[1]?.trim() || '';
      const legajo = note.match(/Legajo:\s*(\d+)/)?.[1] || '';
      const github = note.match(/Github:\s*([a-zA-Z0-9-]+)/)?.[1] || '';
      return legajo
        ? {
            id: legajo,
            nombre,
            telefono,
            legajo,
            github,
            favorito: false,
          }
        : null;
    })
    .filter(Boolean);
}

export function loadAlumnos() {
  return parseVcf(alumnosVcf);
}