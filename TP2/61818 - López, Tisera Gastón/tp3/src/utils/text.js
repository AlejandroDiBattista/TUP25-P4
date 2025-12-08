
export function norm(s) {
  return (s ?? "")
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}


export function cmpNombre(a, b) {
  const na = norm(a?.nombre ?? a);
  const nb = norm(b?.nombre ?? b);
  return na.localeCompare(nb);
}


export function includesContacto(texto, alumno) {
  const t = norm(texto);
  if (!t) return true;
  const nombre = norm(alumno?.nombre ?? "");
  const tel = (alumno?.telefono ?? "").toString().toLowerCase();
  const leg = (alumno?.legajo ?? "").toString().toLowerCase();
  return nombre.includes(t) || tel.includes(t) || leg.includes(t);
}
