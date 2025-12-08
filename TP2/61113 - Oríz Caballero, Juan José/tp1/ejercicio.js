
const fs = require('fs');
const readline = require('readline');

// MODELO 
class Contacto {
  constructor(id, nombre, apellido, edad, telefono, email) {
    this.id = id;
    this.nombre = (nombre || '').trim();
    this.apellido = (apellido || '').trim();
    this.edad = Number.isNaN(parseInt(edad)) ? '' : parseInt(edad);
    this.telefono = (telefono || '').trim();
    this.email = (email || '').trim();
  }
}

 //AGENDA
class Agenda {
  constructor(archivo = 'agenda.json') {
    this.archivo = archivo;
    this.contactos = [];
    this.nextId = 1;
    this.cargar();
  }

  cargar() {
    try {
      if (fs.existsSync(this.archivo)) {
        const raw = fs.readFileSync(this.archivo, 'utf8');
        const data = JSON.parse(raw || '{}');
        this.contactos = Array.isArray(data.contactos) ? data.contactos : [];
        this.nextId = Number.isInteger(data.nextId) ? data.nextId : (this.contactos.at(-1)?.id + 1 || 1);
      }
    } catch (e) {
      console.log('No se pudo cargar el archivo. Se inicia agenda vacía.');
      this.contactos = [];
      this.nextId = 1;
    }
  }

  guardar() {
    try {
      fs.writeFileSync(
        this.archivo,
        JSON.stringify({ contactos: this.contactos, nextId: this.nextId }, null, 2),
        'utf8'
      );
    } catch (e) {
      console.log('Error al guardar la agenda:', e.message);
    }
  }

  agregar(nombre, apellido, edad, telefono, email) {
    const contacto = new Contacto(this.nextId++, nombre, apellido, edad, telefono, email);
    this.contactos.push(contacto);
    this.guardar();
    console.log(' Contacto agregado con éxito.');
  }

  editar(id, nuevosDatos) {
    const contacto = this.contactos.find(c => c.id === id);
    if (!contacto) {
      console.log(' Contacto no encontrado.');
      return;
    }

    const limpio = (v) => (typeof v === 'string' ? v.trim() : v);
    if (nuevosDatos.nombre?.trim()) contacto.nombre = limpio(nuevosDatos.nombre);
    if (nuevosDatos.apellido?.trim()) contacto.apellido = limpio(nuevosDatos.apellido);
    if (nuevosDatos.edad !== '' && !Number.isNaN(parseInt(nuevosDatos.edad))) contacto.edad = parseInt(nuevosDatos.edad);
    if (nuevosDatos.telefono?.trim()) contacto.telefono = limpio(nuevosDatos.telefono);
    if (nuevosDatos.email?.trim()) contacto.email = limpio(nuevosDatos.email);

    this.guardar();
    console.log('  Contacto editado correctamente.');
  }

  borrar(id) {
    const i = this.contactos.findIndex(c => c.id === id);
    if (i === -1) {
      console.log('  Contacto no encontrado.');
      return;
    }
    this.contactos.splice(i, 1);
    this.guardar();
    console.log('  Contacto eliminado.');
  }

  listar() {
    if (this.contactos.length === 0) {
      console.log(' Agenda vacía.');
      return;
    }
    console.log('\n Lista de contactos:');
    const ordenados = this.contactos.slice().sort((a, b) =>
      (a.apellido + a.nombre).localeCompare(b.apellido + b.nombre)
    );
    ordenados.forEach(c => console.log(this.#format(c)));
  }

  buscar(texto) {
    const q = (texto || '').toLowerCase().trim();
    if (!q) {
      console.log('  Escribe algo para buscar.');
      return;
    }
    const rs = this.contactos.filter(c =>
      c.nombre.toLowerCase().includes(q) ||
      c.apellido.toLowerCase().includes(q) ||
      c.telefono.includes(q) ||
      c.email.toLowerCase().includes(q)
    );
    if (rs.length === 0) {
      console.log(' No se encontraron coincidencias.');
      return;
    }
    console.log('\n Resultados de búsqueda:');
    rs.forEach(c => console.log(this.#format(c)));
  }

  #format(c) {
    const edadTxt = (c.edad === '' || Number.isNaN(c.edad)) ? '—' : c.edad;
    return `[${c.id}] ${c.apellido}, ${c.nombre} | Edad: ${edadTxt} | Tel: ${c.telefono || '—'} | Email: ${c.email || '—'}`;
  }
}

// CONSOLA 
const agenda = new Agenda();
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });


const ask = (q) => new Promise(res => rl.question(q, ans => res(ans.trim())));


function printMenu() {
  console.log(`
==============================
        AGENDA DE CONTACTOS
==============================
1) Agregar contacto
2) Editar contacto
3) Borrar contacto
4) Listar contactos
5) Buscar contacto
0) Salir
`);
}

async function accionAgregar() {
  const nombre = await ask('Nombre: ');
  const apellido = await ask('Apellido: ');
  const edad = await ask('Edad: ');
  const telefono = await ask('Teléfono: ');
  const email = await ask('Email: ');
  agenda.agregar(nombre, apellido, edad, telefono, email);
}

async function accionEditar() {
  const id = parseInt(await ask('ID del contacto a editar: '));
  if (Number.isNaN(id)) {
    console.log('  ID inválido.');
    return;
  }
  const c = agenda.contactos.find(x => x.id === id);
  if (!c) {
    console.log('  No existe ese ID.');
    return;
  }
  console.log('Deja vacío para mantener el valor actual.');
  const nombre = await ask(`Nuevo Nombre (${c.nombre}): `);
  const apellido = await ask(`Nuevo Apellido (${c.apellido}): `);
  const edad = await ask(`Nueva Edad (${c.edad || '—'}): `);
  const telefono = await ask(`Nuevo Teléfono (${c.telefono || '—'}): `);
  const email = await ask(`Nuevo Email (${c.email || '—'}): `);

  agenda.editar(id, { nombre, apellido, edad, telefono, email });
}

async function accionBorrar() {
  const id = parseInt(await ask('ID del contacto a borrar: '));
  if (Number.isNaN(id)) {
    console.log('  ID inválido.');
    return;
  }
  agenda.borrar(id);
}

async function accionListar() {
  agenda.listar();
}

async function accionBuscar() {
  const texto = await ask('Texto a buscar: ');
  agenda.buscar(texto);
}

async function main() {

  let seguir = true;
  while (seguir) {
    printMenu();
    const opcion = await ask('Elige una opción: ');
    switch (opcion) {
      case '1': await accionAgregar(); break;
      case '2': await accionEditar(); break;
      case '3': await accionBorrar(); break;
      case '4': await accionListar(); break;
      case '5': await accionBuscar(); break;
      case '0':
        console.log(' Saliendo de la agenda...');
        seguir = false;
        break;
      default:
        console.log('Opción no válida.');
    }
  }
  rl.close();
}

main();
