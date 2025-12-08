export const norm = (text) => {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export const compararNombre = (a, b) => {
  return norm(a.nombre).localeCompare(norm(b.nombre));
};

export const includesContacto = (contacto, query) => {
  const normalizedQuery = norm(query);
  return (
    norm(contacto.nombre).includes(normalizedQuery) ||
    contacto.telefono.includes(normalizedQuery) ||
    contacto.legajo.includes(normalizedQuery)
  );
};