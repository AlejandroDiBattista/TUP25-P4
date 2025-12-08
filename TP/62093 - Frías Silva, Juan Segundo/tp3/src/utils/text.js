// src/utils/text.js

// Normaliza un string: sin acentos y en minúsculas
export function norm(str) {
    return str
      .normalize("NFD") // separa acentos
      .replace(/[\u0300-\u036f]/g, "") // elimina acentos
      .toLowerCase()
      .trim();
  }
  
  // Comparador alfabético por nombre
  export function cmpNombre(a, b) {
    const na = norm(a.nombre);
    const nb = norm(b.nombre);
    if (na < nb) return -1;
    if (na > nb) return 1;
    return 0;
  }
  
  // Busca coincidencia en nombre, teléfono o legajo
  export function includesContacto(contacto, query) {
    const q = norm(query);
    return (
      norm(contacto.nombre).includes(q) ||
      norm(contacto.telefono).includes(q) ||
      norm(contacto.legajo).includes(q)
    );
  }
  