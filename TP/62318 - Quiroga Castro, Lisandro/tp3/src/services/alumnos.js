async function fetchVcf() {
  const res = await fetch("/alumnos.vcf", { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo cargar alumnos.vcf");
  return await res.text();
}

function parseVcf(raw) {
  const cards = [];
  if (!raw) return cards;

  const blocks = raw.split(/BEGIN:VCARD/i).slice(1);
  for (const b of blocks) {
    const block = (b.split(/END:VCARD/i)[0] || "").trim();
    if (!block) continue;

    const fnMatch = block.match(/^\s*FN:(.+)$/im);
    const telMatch = block.match(/^\s*TEL[^:]*:(.+)$/im);
    const noteMatch = block.match(/^\s*NOTE:(.+)$/im);

    const nombre = fnMatch ? fnMatch[1].trim() : "";
    const telefono = telMatch ? telMatch[1].trim() : "";
    const note = noteMatch ? noteMatch[1].trim() : "";

    // legajo en NOTE (Legajo: 12345)
    const legMatch = note.match(/Legajo[:\s]*([0-9]+)/i);
    const legajo = legMatch ? legMatch[1] : "";

    // github en NOTE (Github: usuario)
    const ghMatch = note.match(/Github[:\s]*([A-Za-z0-9_-]+)/i);
    const github = ghMatch ? ghMatch[1] : "";

    const id = legajo || telefono || Math.random().toString(36).slice(2, 9);

    if (nombre) {
      cards.push({
        id,
        nombre,
        telefono,
        legajo,
        github: github || "",
        favorito: false,
      });
    }
  }

  return cards;
}

export async function loadAlumnos() {
  try {
    const raw = await fetchVcf();
    return parseVcf(raw);
  } catch (err) {
    console.error("Error cargando alumnos:", err);
    return [];
  }
}
