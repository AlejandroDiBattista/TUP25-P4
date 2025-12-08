import { loadAlumnos } from './services/alumnos';

console.log('Cargando alumnos...');
const alumnos = loadAlumnos();
console.log('Alumnos cargados:', alumnos);