// Normaliza texto: quita acentos y pasa a minúsculas
export function norm(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// Comparador por nombre completo (alfabético)
export function cmpNombre(a, b) {
  return norm(a.nombre).localeCompare(norm(b.nombre));
}

// Incluye en búsqueda (nombre, teléfono o legajo)
export function includesContacto(contacto, texto) {
  const t = norm(texto);
  return (
    norm(contacto.nombre).includes(t) ||
    contacto.telefono.includes(texto) ||
    String(contacto.legajo).includes(texto)
  );
}
