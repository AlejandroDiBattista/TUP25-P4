export function norm(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function cmpNombre(a, b) {
  return norm(a.nombre).localeCompare(norm(b.nombre));
}

export function includesContacto(contact, searchText) {
  const normalizedSearch = norm(searchText);
  return (
    norm(contact.nombre).includes(normalizedSearch) ||
    norm(contact.telefono).includes(normalizedSearch) ||
    norm(contact.legajo).includes(normalizedSearch)
  );
}
