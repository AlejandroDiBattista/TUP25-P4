export function norm(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function cmpNombre(a, b) {
  return norm(a.nombre).localeCompare(norm(b.nombre));
}

export function includesContacto(contact, query) {
  const n = norm(query);
  return (
    norm(contact.nombre).includes(n) ||
    norm(contact.telefono).includes(n) ||
    norm(contact.legajo).includes(n)
  );
}
