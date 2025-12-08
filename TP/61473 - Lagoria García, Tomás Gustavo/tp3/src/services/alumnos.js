// Carga alumnos desde public/alumnos.vcf

export async function loadAlumnos() {
  const res = await fetch('/alumnos.vcf');
  const vcfText = await res.text();
  return parseVcf(vcfText);
}

export function parseVcf(vcfText) {
  const entries = vcfText.split(/BEGIN:VCARD/i).slice(1);
  const alumnos = entries.map(raw => {
    const fnMatch = raw.match(/FN:(.*)/i);
    const nombre = fnMatch ? fnMatch[1].trim() : '';

    const telMatch = raw.match(/TEL[^:]*:(.*)/i);
    const telefono = telMatch ? telMatch[1].trim() : '';

    const noteMatch = raw.match(/NOTE:(.*)/i);
    const note = noteMatch ? noteMatch[1].trim() : '';

    const legajoMatch = note.match(/Legajo:\s*(\d+)/i);
    const legajo = legajoMatch ? legajoMatch[1] : '';

    const githubMatch = note.match(/Github:\s*([^\s]+)/i);
    const github = githubMatch ? githubMatch[1].trim() : '';

    return {
      id: legajo || `${Math.random().toString(36).slice(2,9)}`,
      nombre,
      telefono,
      legajo,
      github,
      favorito: false,
    };
  });

  return alumnos;
}
