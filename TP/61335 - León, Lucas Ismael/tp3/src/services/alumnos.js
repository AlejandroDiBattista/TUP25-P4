// Parsea el archivo VCF (formato fijo de la cátedra)
export function parseVcf(vcfText) {
  const tarjetas = vcfText.split("END:VCARD");
  const alumnos = [];

  for (const t of tarjetas) {
    const fnMatch = t.match(/FN:(.*)/);
    const telMatch = t.match(/TEL;TYPE=CELL:(.*)/);
    const noteMatch = t.match(/NOTE:(.*)/);

    if (fnMatch && telMatch && noteMatch) {
      const nombre = fnMatch[1].trim();
      const telefono = telMatch[1].trim();
      const note = noteMatch[1];

      const legajoMatch = note.match(/Legajo:\s*(\d+)/i);
      const githubMatch = note.match(/Github:\s*(\S+)/i);

      const legajo = legajoMatch ? parseInt(legajoMatch[1]) : 0;
      const github = githubMatch ? githubMatch[1] : "";

      alumnos.push({
        id: legajo,
        nombre,
        telefono,
        legajo,
        github,
        favorito: false,
      });
    }
  }

  return alumnos;
}

// Carga usando fetch desde public/
export async function loadAlumnos() {
  const resp = await fetch("/alumnos.vcf");
  const text = await resp.text();
  return parseVcf(text);
}
