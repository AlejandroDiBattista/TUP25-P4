// Normaliza texto para búsquedas (sin acentos, todo minúscula)
export const norm = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

// Compara nombres para ordenar
export const cmpNombre = (a, b) => {
  return norm(a.nombre).localeCompare(norm(b.nombre));
};

// Verifica si un contacto coincide con el texto de búsqueda
export const includesContacto = (contacto, searchText) => {
  if (!searchText) return true;
  const search = norm(searchText);
  return (
    norm(contacto.nombre).includes(search) ||
    norm(contacto.telefono).includes(search) ||
    norm(contacto.legajo).includes(search)
  );
};
