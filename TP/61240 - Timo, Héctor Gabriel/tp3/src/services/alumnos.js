const parseVcf = (vcfText) => {
  const vcards = vcfText.split('END:VCARD');
  const alumnos = [];

  vcards.forEach(vcard => {
    if (vcard.trim() === '') return;

    const fnMatch = vcard.match(/FN:(.*)/);
    const telMatch = vcard.match(/TEL;TYPE=CELL:(.*)/);
    const noteMatch = vcard.match(/NOTE:(.*)/s);

    if (fnMatch && telMatch && noteMatch) {
      const nombre = fnMatch[1].trim();
      const telefono = telMatch[1].trim();
      const noteContent = noteMatch[1].trim();

      const legajoMatch = noteContent.match(/Legajo: (\d+)/);
      const githubMatch = noteContent.match(/Github: (\S+)/);

      const legajo = legajoMatch ? legajoMatch[1] : '';
      const github = githubMatch ? githubMatch[1] : '';

      alumnos.push({
        id: legajo,
        nombre,
        telefono,
        legajo,
        github,
        favorito: false,
      });
    }
  });

  return alumnos;
};

export const cargarAlumnos = async () => {
  const response = await fetch('/alumnos.vcf');
  const vcfText = await response.text();
  return parseVcf(vcfText);
};