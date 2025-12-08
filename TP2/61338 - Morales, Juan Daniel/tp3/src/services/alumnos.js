// src/services/alumnos.js
const RE_CARD = /BEGIN:VCARD([\s\S]*?)END:VCARD/g;
const RE_FN   = /\nFN:(.+?)\r?\n/;
const RE_TEL  = /\nTEL;TYPE=CELL:(.+?)\r?\n/;
const RE_LEGAJO = /Legajo\s*:\s*(\d{3,})/i;
const RE_GITHUB = /Github\s*:\s*([A-Za-z0-9-_.]+)/i;

export function parseVcf(vcfText) {
  const alumnos = [];
  let m;
  while ((m = RE_CARD.exec(vcfText))) {
    const card = m[1] || "";
    const nombre   = (card.match(RE_FN)?.[1]  || "").trim();
    const telefono = (card.match(RE_TEL)?.[1] || "").trim();
    const legajo   = Number(card.match(RE_LEGAJO)?.[1] || "");
    const github   = (card.match(RE_GITHUB)?.[1] || "").trim();
    if (!nombre || !legajo) continue;
    alumnos.push({ id: legajo, nombre, telefono, legajo, github, favorito: false });
  }
  return alumnos;
}

export async function loadAlumnos() {
  const vcfRaw = (await import("../alumnos.vcf?raw")).default;
  return parseVcf(vcfRaw);
}
