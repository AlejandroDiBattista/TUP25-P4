import { prompt, read, write } from './io.js';

class Contacto {
  constructor(id, nombre, apellido, edad, telefono, email) {
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.edad = edad;
    this.telefono = telefono;
    this.email = email;
  }
}

class Agenda {
  constructor() {
    this.contactos = [];
    this.ultimoId = 0;
  }

  agregar(contacto) {
    contacto.id = ++this.ultimoId;
    this.contactos.push(contacto);
  }

  static async cargar() {
    const data = await read();
    const arr = JSON.parse(data);
    const agenda = new Agenda();
    agenda.contactos = arr.map(
      c => new Contacto(c.id, c.nombre, c.apellido, c.edad, c.telefono, c.email)
    );
    agenda.ultimoId = agenda.contactos.reduce((max, c) => c.id > max ? c.id : max, 0);
    return agenda;
  }

  async guardar() {
    await write(JSON.stringify(this.contactos, null, 2));
  }

  editar(id, datos) {
    const c = this.contactos.find(c => c.id === id);
    if (c) {
      Object.assign(c, datos);
      return true;
    }
    return false;
  }

  borrar(id) {
    const idx = this.contactos.findIndex(c => c.id === id);
    if (idx !== -1) {
      return this.contactos.splice(idx, 1)[0];
    }
    return null;
  }

  listar() {
    return this.contactos.slice().sort((a, b) => {
      if (a.apellido.toLowerCase() === b.apellido.toLowerCase()) {
        return a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase());
      }
      return a.apellido.toLowerCase().localeCompare(b.apellido.toLowerCase());
    });
  }

  buscar(texto) {
    const t = texto.toLowerCase();
    return this.contactos.filter(c =>
      c.nombre.toLowerCase().includes(t) ||
      c.apellido.toLowerCase().includes(t) ||
      c.telefono.toLowerCase().includes(t) ||
      c.email.toLowerCase().includes(t)
    );
  }
}

function mostrarContactos(contactos) {
  if (contactos.length === 0) {
    console.log('No hay contactos.');
    return;
  }
  console.log('ID    Nombre Completo        Edad      Teléfono      Email');
  contactos.forEach(c => {
    console.log(
      String(c.id).padStart(2, '0').padEnd(5),
      `${c.apellido}, ${c.nombre}`.padEnd(22),
      String(c.edad).padEnd(9),
      String(c.telefono).padEnd(13),
      c.email
    );
  });
}

async function pausa() {
  await prompt('\nPresione Enter para continuar...');
}

async function main() {
  const agenda = await Agenda.cargar();
  let salir = false;
  while (!salir) {
    console.clear();
    console.log('=== AGENDA DE CONTACTOS ===');
    console.log('1. Listar');
    console.log('2. Agregar');
    console.log('3. Editar');
    console.log('4. Borrar');
    console.log('5. Buscar');
    console.log('0. Finalizar\n');
    const op = await prompt('Ingresar opción: > ');

    switch (op.trim()) {
      case '1':
        console.log('\n== Lista de contactos ==\n');
        mostrarContactos(agenda.listar());
        await pausa();
        break;
      case '2':
        console.log('\n=== Agregando contacto ===\n');
        const nombre = await prompt('Nombre: > ');
        const apellido = await prompt('Apellido: > ');
        const edad = parseInt(await prompt('Edad: > '));
        const telefono = await prompt('Teléfono: > ');
        const email = await prompt('Email: > ');
        agenda.agregar(new Contacto(null, nombre, apellido, edad, telefono, email));
        await agenda.guardar();
        await pausa();
        break;
      case '3':
        console.log('\n=== Editar contacto ===\n');
        mostrarContactos(agenda.listar());
        const idEdit = parseInt(await prompt('\nID contacto :> '));
        const cEdit = agenda.contactos.find(c => c.id === idEdit);
        if (!cEdit) {
          console.log('\nNo existe ese contacto.');
          await pausa();
          break;
        }
        const nNombre = await prompt(`Nombre (${cEdit.nombre}): > `) || cEdit.nombre;
        const nApellido = await prompt(`Apellido (${cEdit.apellido}): > `) || cEdit.apellido;
        const nEdad = await prompt(`Edad (${cEdit.edad}): > `) || cEdit.edad;
        const nTelefono = await prompt(`Teléfono (${cEdit.telefono}): > `) || cEdit.telefono;
        const nEmail = await prompt(`Email (${cEdit.email}): > `) || cEdit.email;
        agenda.editar(idEdit, {
          nombre: nNombre,
          apellido: nApellido,
          edad: parseInt(nEdad),
          telefono: nTelefono,
          email: nEmail
        });
        await agenda.guardar();
        await pausa();
        break;
      case '4':
        console.log('\n== Borrar contacto ==');
        mostrarContactos(agenda.listar());
        const idBorrar = parseInt(await prompt('\nID contacto: > '));
        const cBorrar = agenda.contactos.find(c => c.id === idBorrar);
        if (!cBorrar) {
          console.log('\nNo existe ese contacto.');
          await pausa();
          break;
        }
        console.log('\nBorrando...');
        mostrarContactos([cBorrar]);
        const conf = await prompt('¿Confirma borrado? S/N: >  ');
        if (conf.trim().toUpperCase() === 'S') {
          agenda.borrar(idBorrar);
          await agenda.guardar();
          console.log('Contacto borrado.');
        } else {
          console.log('Borrado cancelado.');
        }
        await pausa();
        break;
      case '5':
        console.log('\n== Buscar contacto ==');
        const texto = await prompt('Buscar      :> ');
        mostrarContactos(agenda.buscar(texto));
        await pausa();
        break;
      case '0':
        salir = true;
        break;
      default:
        await pausa();
    }
  }
}
