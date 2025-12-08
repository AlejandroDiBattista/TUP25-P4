// src/utils/text.js

export function norm(s = "") {
  if (!s) return "";
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita acentos
    .toLowerCase()
    .trim();
}

export function cmpNombre(a, b) {
  const na = typeof a === "string" ? norm(a) : norm(a.nombre);
  const nb = typeof b === "string" ? norm(b) : norm(b.nombre);
  if (na < nb) return -1;
  if (na > nb) return 1;
  return 0;
}

export function includesContacto(contacto, termino) {
  if (!termino || termino.trim() === "") return true;
  const t = norm(termino);
  const n = norm(contacto.nombre || "");
  const tel = (contacto.telefono || "").toString().toLowerCase();
  const leg = (contacto.legajo || "").toString();
  return n.includes(t) || tel.includes(t) || leg.includes(t);
}
