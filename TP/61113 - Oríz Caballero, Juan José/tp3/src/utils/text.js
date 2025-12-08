// --- utilidades ---
export function norm(str) {
  return String(str ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function cmpNombre(a, b) {
  const an = norm(a.nombre);
  const bn = norm(b.nombre);
  if (an < bn) return -1;
  if (an > bn) return 1;
  return Number(a.legajo ?? 0) - Number(b.legajo ?? 0);
}

export function includesContacto(alumno, filtro) {
  const q = String(filtro ?? "");
  const qn = norm(q);
  if (!qn) return true;

  const nameMatch = norm(alumno.nombre).includes(qn);
  const telDigits = String(alumno.telefono ?? "").replace(/\D/g, "");
  const qDigits = q.replace(/\D/g, "");
  const telMatch = qDigits ? telDigits.includes(qDigits) : false;
  const legajoMatch = String(alumno.legajo ?? "").includes(q);

  return nameMatch || telMatch || legajoMatch;
}

// --- parseo vcf ---
export function parseVcf(vcfText) {
  if (!vcfText) return [];
  // normalizamos saltos
  const text = vcfText.replace(/\r\n/g, "\n");

  const cards = [];
  const CARD_RE = /BEGIN:VCARD([\s\S]*?)END:VCARD/g;
  let m;
  while ((m = CARD_RE.exec(text)) !== null) {
    const card = m[1];

    const fnMatch  = card.match(/^\s*FN:(.+)$/m);
    const telMatch = card.match(/^\s*TEL;TYPE=CELL:([^\n\r]+)$/m);
    const noteMatch = card.match(/^\s*NOTE:(.+)$/m);

    const nombre = fnMatch ? fnMatch[1].trim() : "Sin nombre";
    const telefono = telMatch ? telMatch[1].trim() : "";

    let legajo = "";
    let github = "";

    if (noteMatch) {
      const note = noteMatch[1];
      const leg = note.match(/Legajo:\s*(\d+)/i);
      if (leg) legajo = leg[1];
      const gh = note.match(/Github:\s*([A-Za-z0-9-]+)/i);
      if (gh) github = gh[1];
    }

    if (!legajo) continue;

    cards.push({
      id: String(legajo),
      nombre,
      telefono,
      legajo: String(legajo),
      github: github || "",
      favorito: false,
    });
  }
  return cards;
}
