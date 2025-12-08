export function norm(texto) {
  if (!texto) return '';
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function cmpNombre(a, b) {
  const nombreA = norm(a.nombre);
  const nombreB = norm(b.nombre);
  return nombreA.localeCompare(nombreB);
}

export function includesContacto(contacto, busqueda) {
  if (!busqueda) return true;
  
  const busquedaNorm = norm(busqueda);
  
  return (
    norm(contacto.nombre).includes(busquedaNorm) ||
    norm(contacto.telefono).includes(busquedaNorm) ||
    norm(contacto.legajo.toString()).includes(busquedaNorm)
  );
}