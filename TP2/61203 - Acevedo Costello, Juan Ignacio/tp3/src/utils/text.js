// src/utils/text.js
export function norm(str = '') {
  const s = String(str || '');
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
}

export function cmpNombre(a, b) {
  const na = norm(a.nombre || a);
  const nb = norm(b.nombre || b);
  if (na < nb) return -1;
  if (na > nb) return 1;
  return 0;
}

export function includesContacto(contact, query) {
  if (!query) return true;
  const q = norm(query);
  const nombre = norm(contact.nombre);
  const telefono = norm(contact.telefono);
  const legajo = norm(contact.legajo || '');
  return nombre.includes(q) || telefono.includes(q) || legajo.includes(q);
}
