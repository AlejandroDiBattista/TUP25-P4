import { read, write, prompt } from "./io.js";

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

  async agregarContacto(nombre, apellido, edad, telefono, email) {
    const nuevo = new Contacto(
      ++this.ultimoId,
      nombre,
      apellido,
      edad,
      telefono,
      email
    );
    this.contactos.push(nuevo);
    this.ordenar();
    await this.guardarJSON();
    console.log("✅ Contacto agregado con éxito!");
  }

  async editarContacto(id, nuevosDatos) {
    const contacto = this.contactos.find((c) => c.id === id);
    if (contacto) {
      Object.assign(contacto, nuevosDatos);
      this.ordenar();
      await this.guardarJSON();
      console.log("✏️ Contacto editado.");
    } else {
      console.log("❌ Contacto no encontrado.");
    }
  }

  async borrarContacto(id) {
    const index = this.contactos.findIndex((c) => c.id === id);
    if (index !== -1) {
      this.contactos.splice(index, 1);
      await this.guardarJSON();
      console.log("🗑️ Contacto eliminado.");
    } else {
      console.log("❌ Contacto no encontrado.");
    }
  }

  listarContactos() {
    console.log("\n📋 Lista de contactos:");
    this.contactos.forEach((c) => {
      console.log(
        `${c.id}. ${c.apellido}, ${c.nombre} - ${c.telefono} - ${c.email}`
      );
    });
  }

  buscarContacto(palabra) {
    const resultados = this.contactos.filter(
      (c) =>
        c.nombre.toLowerCase().includes(palabra.toLowerCase()) ||
        c.apellido.toLowerCase().includes(palabra.toLowerCase())
    );
    console.log("\n🔎 Resultados de la búsqueda:");
    resultados.forEach((c) => {
      console.log(
        `${c.id}. ${c.apellido}, ${c.nombre} - ${c.telefono} - ${c.email}`
      );
    });
  }

  ordenar() {
    this.contactos.sort((a, b) => {
      if (a.apellido === b.apellido) {
        return a.nombre.localeCompare(b.nombre);
      }
      return a.apellido.localeCompare(b.apellido);
    });
  }

  async guardarJSON() {
    const jsonString = JSON.stringify(this, null, 2);
    await write(jsonString, "agenda.json");
  }

  async cargarJSON() {
    try {
      const jsonString = await read("agenda.json");
      const data = JSON.parse(jsonString);
      if (data && data.contactos) {
        this.contactos = data.contactos.map(
          (c) =>
            new Contacto(
              c.id,
              c.nombre,
              c.apellido,
              c.edad,
              c.telefono,
              c.email
            )
        );
        this.ultimoId = data.ultimoId || 0;
      }
    } catch (error) {
      this.contactos = [];
      this.ultimoId = 0;
    }
  }
}
//Menu
async function main() {
  const agenda = new Agenda();
  await agenda.cargarJSON();
  let opcion = "";

  do {
    console.log("\n===== 📒 AGENDA DE CONTACTOS =====");
    console.log("1. Agregar contacto");
    console.log("2. Editar contacto");
    console.log("3. Borrar contacto");
    console.log("4. Listar contactos");
    console.log("5. Buscar contacto");
    console.log("0. Salir");
    opcion = await prompt("👉 Elija una opcion: ");

    switch (opcion) {
      case "1":
        const nombre = await prompt("Nombre: ");
        const apellido = await prompt("Apellido: ");
        const edad = parseInt(await prompt("Edad: ")) || 0;
        const telefono = await prompt("Telefono: ");
        const email = await prompt("Email: ");
        await agenda.agregarContacto(nombre, apellido, edad, telefono, email);
        break;

      case "2":
        const idEditar = parseInt(await prompt("ID del contacto a editar: "));
        if (isNaN(idEditar)) {
          console.log("ID inválido.");
          break;
        }
        const nuevoTelefono = await prompt("Nuevo telefono: ");
        const nuevoEmail = await prompt("Nuevo email: ");
        await agenda.editarContacto(idEditar, {
          telefono: nuevoTelefono,
          email: nuevoEmail,
        });
        break;

      case "3":
        const idBorrar = parseInt(await prompt("ID del contacto a borrar: "));
        if (isNaN(idBorrar)) {
          console.log("ID inválido.");
          break;
        }
        await agenda.borrarContacto(idBorrar);
        break;

      case "4":
        agenda.listarContactos();
        break;

      case "5":
        const palabra = await prompt("Ingrese nombre o apellido a buscar: ");
        agenda.buscarContacto(palabra);
        break;

      case "0":
        console.log("👋 Saliendo de la agenda...");
        break;

      default:
        console.log("❌ Opción inválida.");
    }
  } while (opcion !== "0");
}

main();
