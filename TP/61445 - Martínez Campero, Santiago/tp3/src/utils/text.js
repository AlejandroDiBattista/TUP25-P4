const ACENTOS = {
  'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ñ': 'n',
  'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U', 'Ñ': 'N',
  'à': 'a', 'è': 'e', 'ì': 'i', 'ò': 'o', 'ù': 'u',
  'ä': 'a', 'ë': 'e', 'ï': 'i', 'ö': 'o', 'ü': 'u'
};

export function norm(texto) {
  if (!texto) return '';
  
  let resultado = texto.toLowerCase();
  
  for (let [acentuado, normal] of Object.entries(ACENTOS)) {
    resultado = resultado.split(acentuado).join(normal);
  }
  
  return resultado.trim();
}

export function cmpNombre(alumnoA, alumnoB) {
  const nombreA = norm(alumnoA.nombre || '');
  const nombreB = norm(alumnoB.nombre || '');
  
  if (nombreA.includes(',') && nombreB.includes(',')) {
    const apellidoA = nombreA.split(',')[0].trim();
    const apellidoB = nombreB.split(',')[0].trim();
    return apellidoA.localeCompare(apellidoB);
  }
  
  return nombreA.localeCompare(nombreB);
}

export function includesContacto(alumno, busqueda) {
  if (!busqueda) return true;
  
  const terminoBusqueda = norm(busqueda);
  
  const nombre = norm(alumno.nombre || '');
  if (nombre.includes(terminoBusqueda)) {
    return true;
  }
  
  const telefono = (alumno.telefono || '').replace(/\D/g, '');
  const telefonoBusqueda = busqueda.replace(/\D/g, '');
  if (telefonoBusqueda && telefono.includes(telefonoBusqueda)) {
    return true;
  }
  
  const legajo = String(alumno.legajo || '');
  if (legajo.includes(busqueda)) {
    return true;
  }
  
  return false;
}

export function getIniciales(nombreCompleto) {
  if (!nombreCompleto) return 'UN';
  
  if (nombreCompleto.includes(',')) {
    const partes = nombreCompleto.split(',');
    const apellido = partes[0].trim();
    const nombre = partes[1] ? partes[1].trim() : '';
    
    const inicialApellido = apellido.charAt(0).toUpperCase();
    const inicialNombre = nombre.charAt(0).toUpperCase();
    
    return inicialApellido + (inicialNombre || apellido.charAt(1).toUpperCase());
  }
  
  const palabras = nombreCompleto.split(' ').filter(p => p.length > 0);
  if (palabras.length >= 2) {
    return (palabras[0].charAt(0) + palabras[1].charAt(0)).toUpperCase();
  }
  
  return (nombreCompleto.charAt(0) + nombreCompleto.charAt(1)).toUpperCase();
}

export function debounce(funcion, tiempo = 300) {
  let timeout;
  
  return function ejecutarDespues(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => funcion.apply(this, args), tiempo);
  };
}

export function esUsuarioGitHubValido(usuario) {
  if (!usuario) return false;
  
  const formatoValido = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/;
  return formatoValido.test(usuario) && usuario.length <= 39;
}