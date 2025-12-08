// Funciones de normalización y comparación de texto
export function norm(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function cmpNombre(a, b) {
  return norm(a.nombre).localeCompare(norm(b.nombre));
}

export function includesContacto(contact, query) {
  const nq = norm(query);
  return (
    norm(contact.nombre).includes(nq) ||
    norm(contact.telefono).includes(nq) ||
    norm(contact.legajo).includes(nq)
  );
}
