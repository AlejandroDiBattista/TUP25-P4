export function parseVcf(vcfText) {
  const tarjetas = vcfText.split(/BEGIN:VCARD|END:VCARD/).filter(t => t.includes('FN:'));
  return tarjetas.map(t => {
    const nombre = (t.match(/FN:(.+)/)?.[1] || '').trim();
    const telefono = (t.match(/TEL;TYPE=CELL:(.+)/)?.[1] || '').trim();
    const note = (t.match(/NOTE:(.+)/)?.[1] || '').trim();
    const legajo = (note.match(/Legajo:\s*([\d-]+)/i)?.[1] || '').trim();
    const github = (note.match(/Github:\s*([\w-]+)/i)?.[1] || '').trim();
    return {
      id: legajo,
      nombre,
      telefono,
      legajo,
      github,
      favorito: false
    };
  }).filter(a => a.id && a.nombre);
}

export async function loadAlumnos() {
  const res = await fetch('/alumnos.vcf');
  const text = await res.text();
  return parseVcf(text);
}
