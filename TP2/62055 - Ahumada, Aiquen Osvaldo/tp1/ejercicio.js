import {prompt, read, write} from './io.js';

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
    this.nextId = 1;
  }

  static async cargar() {
    try {
      const datos = await read("./agenda.json");
      const agenda = new Agenda();
      agenda.contactos = datos.contactos || [];
      agenda.nextId = datos.nextId || 1;
      return agenda;
    } catch (err) {
     
      return new Agenda();
    }
  }

  async guardar() {
    await write(
      {
        contactos: this.contactos,
        nextId: this.nextId,
      },
      "./agenda.json"
    );
  }

  agregar(contacto) {
    contacto.id = this.nextId++;
    this.contactos.push(contacto);
    console.log("✅ Contacto agregado con ID:", contacto.id);
  }

  listar() {
    if (this.contactos.length === 0) {
      console.log("⚠ No hay contactos en la agenda.");
      return;
    }
    this.contactos
      .slice()
      .sort((a, b) =>
        (a.nombre + a.apellido).localeCompare(b.nombre + b.apellido)
      )
      .forEach((c) =>
        console.log(
          `[${c.id}] ${c.nombre} ${c.apellido} - ${c.edad} años - ${c.telefono} - ${c.email}`
        )
      );
  }

  buscar(texto) {
    let resultados = this.contactos.filter(
      (c) =>
        c.nombre.toLowerCase().includes(texto.toLowerCase()) ||
        c.apellido.toLowerCase().includes(texto.toLowerCase()) ||
        c.telefono.includes(texto) ||
        c.email.toLowerCase().includes(texto.toLowerCase())
    );
    if (resultados.length === 0) {
      console.log("⚠ No se encontraron coincidencias.");
    } else {
      resultados.forEach((c) =>
        console.log(`[${c.id}] ${c.nombre} ${c.apellido} - ${c.telefono}`)
      );
    }
  }

  editar(id, datos) {
    let c = this.contactos.find((c) => c.id == id);
    if (!c) {
      console.log("⚠ Contacto no encontrado.");
      return;
    }
    Object.assign(c, datos);
    console.log("✏ Contacto actualizado.");
  }

  borrar(id) {
    let i = this.contactos.findIndex((c) => c.id == id);
    if (i === -1) {
      console.log("⚠ Contacto no encontrado.");
      return;
    }
    this.contactos.splice(i, 1);
    console.log("🗑 Contacto eliminado.");
  }
}

async function main() {
  let agenda = await Agenda.cargar();

  while (true) {
    console.log("\n=== AGENDA DE CONTACTOS ===");
    console.log("1. Agregar contacto");
    console.log("2. Listar contactos");
    console.log("3. Buscar contacto");
    console.log("4. Editar contacto");
    console.log("5. Borrar contacto");
    console.log("0. Salir");

    let opcion = await prompt("Opción: ");
    switch (opcion) {
      case "1": {
        let nombre = await prompt("Nombre: ");
        let apellido = await prompt("Apellido: ");
        let edad = await prompt("Edad: ");
        let telefono = await prompt("Teléfono: ");
        let email = await prompt("Email: ");
        let c = new Contacto(null, nombre, apellido, edad, telefono, email);
        agenda.agregar(c);
        await agenda.guardar();
        break;
      }
      case "2":
        agenda.listar();
        break;
      case "3": {
        let texto = await prompt("Buscar: ");
        agenda.buscar(texto);
        break;
      }
      case "4": {
        let id = await prompt("ID del contacto a editar: ");
        let nombre = await prompt("Nuevo nombre (Enter = no cambiar): ");
        let apellido = await prompt("Nuevo apellido (Enter = no cambiar): ");
        let edad = await prompt("Nueva edad (Enter = no cambiar): ");
        let telefono = await prompt("Nuevo teléfono (Enter = no cambiar): ");
        let email = await prompt("Nuevo email (Enter = no cambiar): ");
        let datos = {};
        if (nombre) datos.nombre = nombre;
        if (apellido) datos.apellido = apellido;
        if (edad) datos.edad = edad;
        if (telefono) datos.telefono = telefono;
        if (email) datos.email = email;
        agenda.editar(id, datos);
        await agenda.guardar();
        break;
      }
      case "5": {
        let id = await prompt("ID del contacto a borrar: ");
        agenda.borrar(id);
        await agenda.guardar();
        break;
      }
      case "0":
        console.log("👋 ¡Hasta luego!");
        return;
      default:
        console.log("⚠ Opción inválida.");
    }
  }
}

main();
