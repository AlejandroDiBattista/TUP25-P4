// Normaliza texto: quita acentos, pone en minúsculas y recorta espacios
export function norm(str) {
  if (!str && str !== '') return '';
  return String(str)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

// Comparador por nombre normalizado
export function cmpNombre(a, b) {
  const na = norm(a.nombre);
  const nb = norm(b.nombre);
  if (na < nb) return -1;
  if (na > nb) return 1;
  return 0;
}

// Comprueba si el término está incluido en nombre, telefono o legajo
export function includesContacto(contacto, term) {
  const t = norm(term);
  if (!t) return true;

  return (
    norm(contacto.nombre).includes(t) ||
    norm(contacto.telefono).includes(t) ||
    norm(contacto.legajo).includes(t)
  );
}