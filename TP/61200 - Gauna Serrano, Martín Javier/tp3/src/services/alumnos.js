import alumnosVcf from "../../public/alumnos.vcf?raw";

// Parsea el VCF y devuelve un array de objetos alumno
export function parseVcf(vcfText) {
  const cards = vcfText.split("END:VCARD");
  const alumnos = [];

  for (const card of cards) {
    if (!card.includes("FN")) continue;

    const nombre = (card.match(/FN:(.*)/) || [])[1]?.trim() || "";
    const telefono = (card.match(/TEL;TYPE=CELL:(.*)/) || [])[1]?.trim() || "";
    const note = (card.match(/NOTE:(.*)/) || [])[1]?.trim() || "";

    const legajoMatch = note.match(/Legajo:\s*(\d+)/i);
    const githubMatch = note.match(/Github:\s*(\S+)/i);

    alumnos.push({
      id: legajoMatch ? legajoMatch[1] : nombre,
      nombre,
      telefono,
      legajo: legajoMatch ? legajoMatch[1] : "",
      github: githubMatch ? githubMatch[1] : "",
      favorito: false,
    });
  }

  return alumnos;
}

export function loadAlumnos() {
  return parseVcf(alumnosVcf);
}
