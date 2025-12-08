// Parsea una cadena VCF y devuelve un array de objetos de alumno
export const parseVcf = (vcf) => {
  if (!vcf || typeof vcf !== "string") {
    console.error("VCF inválido:", vcf);
    return [];
  }
  const cards = vcf.split("BEGIN:VCARD").slice(1);
  return cards.map((card) => {
    const getFN = card.match(/FN:(.+)/)?.[1] || "";
    const getTEL = card.match(/TEL;TYPE=CELL:(.+)/)?.[1] || "";
    const getNote = card.match(/NOTE:(.+)/)?.[1] || "";
    const legajo = getNote.match(/Legajo: (\d+)/)?.[1] || "";
    const github = getNote.match(/Github: ([^\s]+)/)?.[1] || "";
    return {
      id: legajo,
      nombre: getFN,
      telefono: getTEL,
      legajo,
      github,
      favorito: false,
    };
  });
};

// Carga y parsea el archivo VCF desde public
export const loadAlumnos = async () => {
  const response = await fetch("/alumnos.vcf");
  const vcf = await response.text();
  return parseVcf(vcf);
};
