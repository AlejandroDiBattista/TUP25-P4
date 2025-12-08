// src/utils/text.js

// Normaliza texto: quita tildes, pasa a minúsculas
export function norm(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// Compara por nombre normalizado
export function cmpNombre(a, b) {
  return norm(a.nombre).localeCompare(norm(b.nombre));
}

// Busca coincidencia en nombre, telefono o legajo
export function includesContacto(contacto, query) {
  const nq = norm(query);
  return (
    norm(contacto.nombre).includes(nq) ||
    norm(contacto.telefono).includes(nq) ||
    norm(contacto.legajo).includes(nq)
  );
}