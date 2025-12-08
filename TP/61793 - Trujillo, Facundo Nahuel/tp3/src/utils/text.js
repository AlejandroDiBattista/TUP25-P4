// src/utils/text.js

// normaliza texto (quita acentos, pasa a minúsculas)
export const norm = (s = '') => {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
};

// compara nombres alfabéticamente
export const cmpNombre = (a, b) => {
  return norm(a.nombre).localeCompare(norm(b.nombre));
};

// verifica si un contacto incluye el término de búsqueda
export const includesContacto = (contacto, term) => {
  if (!term) return true;
  const t = norm(term);
  if (norm(contacto.nombre).includes(t)) return true;
  if (norm(contacto.telefono).includes(t)) return true;
  if (norm(contacto.legajo).includes(t)) return true;
  return false;
};
