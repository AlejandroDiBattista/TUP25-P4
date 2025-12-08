import {prompt, read, write} from './io.js';

import fs from 'fs';
import readline from 'readline-sync';

// Nombre fijo del archivo donde se guardarán los contactos
const NOMBRE_ARCHIVO = 'agenda.json';

// --- CLASE: EntradaDeContacto ---
class EntradaDeContacto {
  constructor(id, nombre, apellido, edad, telefono, email) {
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.edad = edad;
    this.telefono = telefono;
    this.email = email;
  }

  get nombreCompleto() {
    return `${this.apellido}, ${this.nombre}`;
  }

  toString() {
    return `${this.id.toString().padStart(2, ' ')} | ${this.nombreCompleto.padEnd(25)} | ${this.edad.toString().padEnd(5)} | ${this.telefono.padEnd(12)} | ${this.email}`;
  }
}

// --- CLASE: DirectorioDeContactos ---
class DirectorioDeContactos {
  constructor(entradas = []) {
    this.entradas = entradas;
    this.proximoId = entradas.length > 0 ? Math.max(...entradas.map(e => e.id)) + 1 : 1;
  }

  static cargarDesdeArchivo() {
    try {
      if (!fs.existsSync(NOMBRE_ARCHIVO)) {
        console.log('No se encontró agenda.json. Se creará automáticamente.');
        return new DirectorioDeContactos();
      }
      const datos = fs.readFileSync(NOMBRE_ARCHIVO, 'utf8');
      if (!datos.trim()) return new DirectorioDeContactos();
      const entradasRaw = JSON.parse(datos);
      const entradas = entradasRaw.map(e => new EntradaDeContacto(e.id, e.nombre, e.apellido, e.edad, e.telefono, e.email));
      console.log('Agenda cargada desde agenda.json');
      return new DirectorioDeContactos(entradas);
    } catch (error) {
      console.log('Error al leer agenda.json. Se creará una nueva.');
      return new DirectorioDeContactos();
    }
  }

  guardarEnArchivo() {
    try {
      const datos = JSON.stringify(this.entradas, null, 2);
      fs.writeFileSync(NOMBRE_ARCHIVO, datos, 'utf8');
      console.log('Agenda guardada con éxito en agenda.json.');
    } catch (error) {
      console.error('Error al guardar la agenda:', error.message);
    }
  }

  mostrarTodas() {
    return this.entradas.sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));
  }

  encontrarPorId(id) {
    return this.entradas.find(e => e.id === id);
  }

  buscarEntradas(texto) {
    const textoBuscado = texto.toLowerCase();
    return this.entradas.filter(e =>
      e.nombre.toLowerCase().includes(textoBuscado) ||
      e.apellido.toLowerCase().includes(textoBuscado) ||
      e.email.toLowerCase().includes(textoBuscado)
    );
  }

  registrarNueva(datos) {
    const nuevaEntrada = new EntradaDeContacto(this.proximoId++, datos.nombre, datos.apellido, datos.edad, datos.telefono, datos.email);
    this.entradas.push(nuevaEntrada);
    console.log(`\nEntrada para '${datos.nombre}' agregada.`);
  }

  actualizar(id, datosNuevos) {
    const entrada = this.encontrarPorId(id);
    if (!entrada) return false;
    Object.assign(entrada, datosNuevos);
    console.log(`\nEntrada para ID ${id} actualizada con éxito.`);
    return true;
  }

  eliminar(id) {
    const indice = this.entradas.findIndex(e => e.id === id);
    if (indice === -1) return false;
    this.entradas.splice(indice, 1);
    console.log(`\nEntrada para ID ${id} eliminada con éxito.`);
    return true;
  }
}

// --- LÓGICA PRINCIPAL ---
function ejecutarPrograma() {
  const directorio = DirectorioDeContactos.cargarDesdeArchivo();

  let continuar = true;
  while (continuar) {
    console.clear();
    console.log('--- AGENDA DE CONTACTOS ---');
    console.log('1. Ver todas las entradas');
    console.log('2. Registrar nueva entrada');
    console.log('3. Actualizar una entrada');
    console.log('4. Eliminar una entrada');
    console.log('5. Buscar en la agenda');
    console.log('0. Guardar y Salir');

    const eleccion = parseInt(readline.question('Ingresa tu eleccion: '));

    switch (eleccion) {
      case 1:
        console.log('\n--- LISTADO DE ENTRADAS ---');
        console.log('ID | Apellido, Nombre        | Edad  | Teléfono     | Email');
        console.log('--------------------------------------------------------------------------------');
        directorio.mostrarTodas().forEach(e => console.log(e.toString()));
        break;

      case 2:
        const datosDelNuevo = {};
        datosDelNuevo.nombre = readline.question('Nombre: ');
        datosDelNuevo.apellido = readline.question('Apellido: ');
        datosDelNuevo.edad = parseInt(readline.question('Edad: '));
        datosDelNuevo.telefono = readline.question('Telefono: ');
        datosDelNuevo.email = readline.question('Email: ');
        directorio.registrarNueva(datosDelNuevo);
        break;

      case 3:
        const idActualizar = parseInt(readline.question('ID de la entrada a actualizar: '));
        const entradaAActualizar = directorio.encontrarPorId(idActualizar);
        if (entradaAActualizar) {
          const nuevosDatos = {};
          nuevosDatos.nombre = readline.question(`Nuevo nombre (${entradaAActualizar.nombre}): `) || entradaAActualizar.nombre;
          nuevosDatos.apellido = readline.question(`Nuevo apellido (${entradaAActualizar.apellido}): `) || entradaAActualizar.apellido;
          nuevosDatos.edad = parseInt(readline.question(`Nueva edad (${entradaAActualizar.edad}): `)) || entradaAActualizar.edad;
          nuevosDatos.telefono = readline.question(`Nuevo telefono (${entradaAActualizar.telefono}): `) || entradaAActualizar.telefono;
          nuevosDatos.email = readline.question(`Nuevo email (${entradaAActualizar.email}): `) || entradaAActualizar.email;
          directorio.actualizar(idActualizar, nuevosDatos);
        } else {
          console.log('\nEntrada no encontrada.');
        }
        break;

      case 4:
        const idEliminar = parseInt(readline.question('ID de la entrada a eliminar: '));
        const confirmacion = readline.question(`Confirmar eliminacion de ID ${idEliminar} (S/N): `).toLowerCase();
        if (confirmacion === 's') {
          directorio.eliminar(idEliminar);
        } else {
          console.log('Operación cancelada.');
        }
        break;

      case 5:
        const textoBusqueda = readline.question('Ingresa texto para buscar: ');
        const resultados = directorio.buscarEntradas(textoBusqueda);
        if (resultados.length === 0) {
          console.log('\nNo se encontraron coincidencias.');
        } else {
          console.log('\n--- RESULTADOS DE BÚSQUEDA ---');
          console.log('ID | Apellido, Nombre        | Edad  | Teléfono     | Email');
          console.log('--------------------------------------------------------------------------------');
          resultados.forEach(e => console.log(e.toString()));
        }
        break;

      case 0:
        directorio.guardarEnArchivo();
        console.log('¡Hasta pronto!');
        continuar = false;
        break;

      default:
        console.log('\nOpción inválida. Por favor, intenta de nuevo.');
        break;
    }

    if (continuar) {
      readline.question('\nPresiona Enter para continuar...');
    }
  }
}

ejecutarPrograma();

