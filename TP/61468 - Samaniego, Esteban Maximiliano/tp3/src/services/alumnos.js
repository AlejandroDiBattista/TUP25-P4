import alumnosVcf from "../../public/alumnos.vcf?raw";

export function parseVcf(vcfText) {
  const tarjetas = vcfText.split("END:VCARD");

  return tarjetas
    .map((tarjeta) => {
      const nombre = tarjeta.match(/FN:(.*)/)?.[1]?.trim();
      const telefono = tarjeta.match(/TEL;TYPE=CELL:(.*)/)?.[1]?.trim();
      const note = tarjeta.match(/NOTE:(.*)/)?.[1]?.trim();

      // Ejemplo NOTE: "Legajo: 123 Github: pepito"
      const legajo = note?.match(/Legajo:\s*(\d+)/)?.[1];
      const github = note?.match(/Github:\s*(\S+)/)?.[1] ?? "";

      if (!nombre || !telefono || !legajo) return null;

      return {
        id: legajo,
        nombre,
        telefono,
        legajo,
        github,
        favorite: false,
      };
    })
    .filter(Boolean);
};

export function loadAlumnos() {
    return parseVcf(alumnosVcf);
}

export default loadAlumnos;