/**
 * Formatea un número como precio en pesos argentinos
 * @param precio - El precio a formatear
 * @returns String formateado con símbolo $ y formato argentino (ej: $1.234,56)
 */
export const formatearPrecio = (precio: number): string => {
  return precio.toLocaleString('es-AR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};

/**
 * Formatea una fecha al formato argentino
 * @param fecha - La fecha a formatear (string ISO o Date)
 * @returns String formateado (ej: "6 de noviembre de 2025, 14:30")
 */
export const formatearFecha = (fecha: string | Date): string => {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return fechaObj.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
