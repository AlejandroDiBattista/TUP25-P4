// Archivo principal (ej: agenda.js)

import { prompt, read, write } from './io.js';

// --- Clases ---
class Contacto {
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
    return `${this.id.toString().padStart(2, "0")} ${this.nombreCompleto.padEnd(20)} ${this.edad.toString().padEnd(5)} ${this.telefono.padEnd(12)} ${this.email}`;
  }
}

class Agenda {
  constructor(contactos = []) {
    this.contactos = contactos;
    this.ultimoId = contactos.length > 0 ? Math.max(...contactos.map(c => c.id)) : 0;
  }

static async cargar() {
  try {
    const data = await read();
    const contactos = JSON.parse(data); // <-- POSIBLE ERROR AQUÍ
    return new Agenda(contactos);
  } catch (e) {
    return new Agenda();
  }
}

  async guardar() {
    await write(JSON.stringify(this.contactos, null, 2));
  }

  listar() {
    return this.contactos
      .sort((a, b) => (a.apellido + a.nombre).localeCompare(b.apellido + b.nombre));
  }

  buscarPorId(id) {
    return this.contactos.find(c => c.id === id);
  }

  buscar(texto) {
    texto = texto.toLowerCase();
    return this.contactos.filter(c =>
      c.nombre.toLowerCase().includes(texto) ||
      c.apellido.toLowerCase().includes(texto) ||
      c.email.toLowerCase().includes(texto) ||
      c.telefono.includes(texto)
    );
  }

  agregar(contacto) {
    contacto.id = ++this.ultimoId;
    this.contactos.push(contacto);
  }

  editar(id, datos) {
    const c = this.buscarPorId(id);
    if (!c) return false;
    Object.assign(c, datos);
    return true;
  }

  borrar(id) {
    const i = this.contactos.findIndex(c => c.id === id);
    if (i === -1) return false;
    this.contactos.splice(i, 1);
    return true;
  }
}

// --- Lógica de la interfaz de usuario ---
async function main() {
  let agenda = await Agenda.cargar();

  while (true) {
    console.clear();
    console.log('=== AGENDA DE CONTACTOS ===');
    console.log('1. Listar');
    console.log('2. Agregar');
    console.log('3. Editar');
    console.log('4. Borrar');
    console.log('5. Buscar');
    console.log('0. Finalizar');

    const opcion = parseInt(await prompt('Ingresar opción :> '));

    switch (opcion) {
      case 1:
        console.log('\n== Lista de contactos ==');
        console.log('ID Nombre Completo      Edad  Teléfono     Email');
        agenda.listar().forEach(c => console.log(c.toString()));
        break;
      
      case 2:
        console.log('\n== Agregando contacto ==');
        const nuevoContacto = new Contacto();
        nuevoContacto.nombre = await prompt('Nombre     :> ');
        nuevoContacto.apellido = await prompt('Apellido   :> ');
        nuevoContacto.edad = parseInt(await prompt('Edad       :> '));
        nuevoContacto.telefono = await prompt('Teléfono   :> ');
        nuevoContacto.email = await prompt('Email      :> ');
        agenda.agregar(nuevoContacto);
        console.log('\nContacto agregado con éxito!');
        break;
      
      case 3:
        console.log('\n== Editando contacto ==');
        const idEditar = parseInt(await prompt('ID contacto :> '));
 const contactoAEditar = agenda.buscarPorId(idEditar);
 if (contactoAEditar) {
 const datosNuevos = {};
 datosNuevos.nombre = await prompt(`Nombre (${contactoAEditar.nombre}) :> `) || contactoAEditar.nombre;
          datosNuevos.apellido = await prompt(`Apellido (${contactoAEditar.apellido}) :> `) || contactoAEditar.apellido;
          datosNuevos.edad = parseInt(await prompt(`Edad (${contactoAEditar.edad}) :> `)) || contactoAEditar.edad;
          datosNuevos.telefono = await prompt(`Teléfono (${contactoAEditar.telefono}) :> `) || contactoAEditar.telefono;
          datosNuevos.email = await prompt(`Email (${contactoAEditar.email}) :> `) || contactoAEditar.email;
          agenda.editar(idEditar, datosNuevos);
          console.log('\nContacto actualizado con éxito!');
        } else {
          console.log('\nContacto no encontrado.');
        }
        break;
      
      case 4:
        console.log('\n== Borrar contacto ==');
        const idBorrar = parseInt(await prompt('ID contacto :> '));
        const contactoABorrar = agenda.buscarPorId(idBorrar);
        if (contactoABorrar) {
          console.log('\nBorrando...');
          console.log(contactoABorrar.toString());
          const confirmacion = await prompt('¿Confirma borrado? (S/N) :> ');
          if (confirmacion.toLowerCase() === 's') {
            agenda.borrar(idBorrar);
            console.log('\nContacto borrado con éxito!');
          } else {
            console.log('\nOperación cancelada.');
          }
        } else {
          console.log('\nContacto no encontrado.');
        }
        break;
      
      case 5:
        console.log('\n== Buscar contacto ==');
        const textoBusqueda = await prompt('Buscar :> ');
        const resultados = agenda.buscar(textoBusqueda);
        console.log('\nID Nombre Completo      Edad  Teléfono     Email');
        resultados.forEach(c => console.log(c.toString()));
        break;
      
      case 0:
        await agenda.guardar();
        console.log('\nAgenda guardada. ¡Hasta pronto!');
        return;
      
      default:
        console.log('\nOpción no válida. Inténtalo de nuevo.');
    }

    await prompt('\nPresione Enter para continuar...');
  }
}

// Iniciar la aplicación
main();