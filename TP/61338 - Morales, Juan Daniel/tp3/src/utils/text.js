export function norm(str = "") {
  return String(str).normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
}
export function digits(str = "") { return String(str).replace(/\D+/g, ""); }
export function cmpNombre(a, b) { return norm(a.nombre).localeCompare(norm(b.nombre), "es", { sensitivity: "base" }); }
export function includesContacto(c, qRaw) {
  const q = norm(qRaw); if (!q) return true;
  const qDigits = digits(qRaw);
  const nombre = norm(c.nombre), tel = digits(c.telefono), leg = String(c.legajo);
  return nombre.includes(q) || (qDigits && tel.includes(qDigits)) || leg.includes(q) || (qDigits && leg.includes(qDigits));
}
