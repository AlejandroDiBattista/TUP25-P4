import alumnosVcf from '../alumnos.vcf?raw';

export function parseVcf(vcfText) {
  const tarjetas = vcfText.split('END:VCARD').filter(t => t.trim());
  return tarjetas.map(t => {
    const nombre = t.match(/FN:(.+)/)?.[1] || '';
    const telefono = t.match(/TEL;TYPE=CELL:(.+)/)?.[1] || '';
    const note = t.match(/NOTE:(.+)/)?.[1] || '';
    const legajo = note.match(/Legajo: (\d+)/)?.[1] || '';
    const github = note.match(/Github: (\w+)/)?.[1] || '';

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