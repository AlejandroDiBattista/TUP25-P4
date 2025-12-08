import alumnosVcf from "../../public/alumnos.vcf?raw";

export function parseVcf(vcfContent) {
  const contacts = [];
  const cards = vcfContent.trim().split("END:VCARD");

  for (const card of cards) {
    if (card.trim() === "") continue;

    const fnMatch = card.match(/FN:(.*)/);
    const telMatch = card.match(/TEL;TYPE=CELL:(.*)/);
    const noteMatch = card.match(/NOTE:(.*)/);

    if (fnMatch && telMatch && noteMatch) {
      const nombre = fnMatch[1].trim();
      const telefono = telMatch[1].trim();
      const note = noteMatch[1].trim();

      const legajoMatch = note.match(/Legajo: (\d+)/);
      const githubMatch = note.match(/Github: (\S+)/);

      if (legajoMatch) {
        const legajo = legajoMatch[1];
        const github = githubMatch ? githubMatch[1].trim() : "";

        contacts.push({
          id: legajo,
          nombre,
          telefono,
          legajo,
          github,
          favorito: false,
        });
      }
    }
  }
  return contacts;
}

export function loadAlumnos() {
  return parseVcf(alumnosVcf);
}
