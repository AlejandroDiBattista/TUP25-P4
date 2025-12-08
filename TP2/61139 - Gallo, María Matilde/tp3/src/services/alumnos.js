
export function parseVcf(text) {
  const regexAlumno = /BEGIN:VCARD[\s\S]*?END:VCARD/g;
  const alumnosRaw = text.match(regexAlumno) || [];

  return alumnosRaw.map(card => {
    const nombre = (card.match(/FN:(.+)/) || [])[1]?.trim() || '';
    const telefono = (card.match(/TEL;TYPE=CELL:(.+)/) || [])[1]?.trim() || '';
    const legajo = (card.match(/Legajo:\s*(\d+)/) || [])[1]?.trim() || '';
    const github = (card.match(/Github:\s*(\S+)/) || [])[1]?.trim() || '';

    return {
      id: legajo,
      nombre,
      telefono,
      legajo,
      github,
      favorito: false
    };
  });
}

export async function loadAlumnos() {
  const res = await fetch('/alumnos.vcf');
  const text = await res.text();
  return parseVcf(text);
}
