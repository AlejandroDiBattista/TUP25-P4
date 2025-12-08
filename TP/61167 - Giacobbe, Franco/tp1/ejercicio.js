import { prompt, read, write } from "./io.js";

class Contacto {
  static ultimoId = 0;

  constructor(nombre, apellido, edad, telefono, email) {
    this.id = ++Contacto.ultimoId;
    Contacto.ultimoId = this.id;
    this.nombre = nombre.toUpperCase();
    this.apellido = apellido.toUpperCase();
    this.edad = edad;
    this.telefono = telefono;
    this.email = email.toLowerCase();
  }
}

class Agenda {
  constructor() {
    this.contactos = [];
  }

  agregar(contacto) {
    this.contactos.push(contacto);
  }

  listar() {
    return this.contactos
      .sort((a, b) => a.apellido.localeCompare(b.apellido) || a.nombre.localeCompare(b.nombre));
  }

  encontrarPorId(id) {
    return this.contactos.find(c => c.id === id);
  }

  editar(id, nuevoNombre, nuevoApellido, nuevaEdad, nuevoTelefono, nuevoEmail) {
    const c = this.encontrarPorId(id);
    if (!c) return false;
    c.nombre = nuevoNombre.toUpperCase();
    c.apellido = nuevoApellido.toUpperCase();
    c.edad = nuevaEdad;
    c.telefono = nuevoTelefono;
    c.email = nuevoEmail.toLowerCase();
    return true;
  }

  buscarPorNombre(valor) {
    return this.contactos.filter(c => c.nombre.includes(valor.toUpperCase()));
  }

  buscarPorApellido(valor) {
    return this.contactos.filter(c => c.apellido.includes(valor.toUpperCase()));
  }

  buscarPorEmail(valor) {
    return this.contactos.filter(c => c.email.includes(valor.toLowerCase()));
  }

  eliminar(id) {
    this.contactos = this.contactos.filter(c => c.id !== id);
  }

  async guardar() {
    await write(JSON.stringify(this.contactos, null, 2));
  }

  static async cargar() {
    const data = await read("./agenda.json");
    const agenda = new Agenda();
    agenda.contactos = JSON.parse(data);

    agenda.contactos.forEach(c => {
      if (c.id > Contacto.ultimoId) Contacto.ultimoId = c.id;
    });

    return agenda;
  }
}

const agenda = await Agenda.cargar();
let opcion;

do {
  console.clear();
  console.log("-------- MENU AGENDA --------");
  console.log("1. Agregar contacto");
  console.log("2. Listar contactos");
  console.log("3. Editar contacto");
  console.log("4. Buscar contacto");
  console.log("5. Eliminar contacto");
  console.log("6. Salir");
  opcion = await prompt("Seleccione una opción:> ");

  switch (opcion) {
    case "1": {
      console.clear();
      console.log("=== Agregar contacto ===\n");

      const nombre = await prompt("Nombre:> ");
      const apellido = await prompt("Apellido:> ");
      const edad = await prompt("Edad:> ");
      const telefono = await prompt("Teléfono:> ");
      const email = await prompt("Email:> ");

      const nuevoContacto = new Contacto(nombre, apellido, edad, telefono, email);
      agenda.agregar(nuevoContacto);
      await agenda.guardar();

      console.log("\nContacto agregado correctamente");
      await prompt("\nPresione cualquier tecla para volver...");
      break;
    }

    case "2": {
      console.clear();
      console.log("=== Lista de contactos ===\n");

      const lista = agenda.listar();
      console.log("ID".padEnd(5) + "Nombre Completo".padEnd(25) + "Edad".padEnd(8) + "Teléfono".padEnd(15) + "Email");
      lista.forEach(c => {
        const nombreCompleto = `${c.apellido}, ${c.nombre}`;
        console.log(
          String(c.id).padEnd(5) +
          nombreCompleto.padEnd(25) +
          String(c.edad).padEnd(8) +
          c.telefono.padEnd(15) +
          c.email
        );
      });

      await prompt("\nPresione cualquier tecla para volver...");
      break;
    }

    case "3": {
      console.clear();
      console.log("=== Editar contacto ===\n");

      const id = parseInt(await prompt("ID del contacto a editar:> "));
      const contacto = agenda.encontrarPorId(id);

      if (!contacto) {
        console.log("No se encontró un contacto con ese ID.");
        await prompt("\nPresione cualquier tecla para volver...");
        break;
      }

      const nombre = await prompt("Nuevo Nombre:> ");
      const apellido = await prompt("Nuevo Apellido:> ");
      const edad = await prompt("Nueva Edad:> ");
      const telefono = await prompt("Nuevo Teléfono:> ");
      const email = await prompt("Nuevo Email:> ");

      agenda.editar(id, nombre, apellido, edad, telefono, email);
      await agenda.guardar();

      console.log("\nContacto editado correctamente");
      await prompt("\nPresione cualquier tecla para volver...");
      break;
    }

    case "4": {
      console.clear();
      console.log("=== Buscar contacto ===\n");

      const criterio = await prompt("Buscar por (nombre, apellido o email):> ");
      const valor = await prompt("Ingrese el valor a buscar:> ");

      let resultados = [];
      if (criterio.toLowerCase() === "nombre") resultados = agenda.buscarPorNombre(valor);
      else if (criterio.toLowerCase() === "apellido") resultados = agenda.buscarPorApellido(valor);
      else if (criterio.toLowerCase() === "email") resultados = agenda.buscarPorEmail(valor);

      if (resultados.length > 0) {
        console.log("\nContactos encontrados:");
        console.log("ID".padEnd(5) + "Nombre Completo".padEnd(25) + "Edad".padEnd(8) + "Teléfono".padEnd(15) + "Email");
        resultados.forEach(c => {
          const nombreCompleto = `${c.apellido}, ${c.nombre}`;
          console.log(
            String(c.id).padEnd(5) +
            nombreCompleto.padEnd(25) +
            String(c.edad).padEnd(8) +
            c.telefono.padEnd(15) +
            c.email
          );
        });
      } else {
        console.log("\nNo se encontraron contactos");
      }

      await prompt("\nPresione cualquier tecla para volver...");
      break;
    }

    case "5": {
      console.clear();
      console.log("=== Eliminar contacto ===\n");

      const id = parseInt(await prompt("ID del contacto a eliminar:> "));
      const contacto = agenda.encontrarPorId(id);

      if (!contacto) {
        console.log("No se encontró un contacto con ese ID.");
        await prompt("\nPresione cualquier tecla para volver...");
        break;
      }

      console.log("\nContacto a eliminar:", contacto);
      const confirmacion = await prompt("Presione S/N:> ");
      if (confirmacion.toUpperCase() === "S") {
        agenda.eliminar(id);
        await agenda.guardar();
        console.log("\nContacto eliminado correctamente");
      } else {
        console.log("\nEliminación cancelada");
      }

      await prompt("\nPresione cualquier tecla para volver...");
      break;
    }

    case "6":
      console.clear();
      console.log("=== Salir ===");
      break;

    default:
      console.log("Opción inválida");
  }
} while (opcion !== "6");
