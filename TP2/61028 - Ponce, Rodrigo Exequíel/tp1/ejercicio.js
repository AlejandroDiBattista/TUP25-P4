import { prompt, read, write } from './io.js';

const FILE_PATH = './agenda.json'; 


class Contacto {
  constructor(id, nombre, apellido, edad, telefono, email) {
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.edad = edad;
    this.telefono = telefono;
    this.email = email;
  }

  getNombreCompleto() {
    return `${this.apellido}, ${this.nombre}`;
  }
}

class Agenda {
  constructor() {
    this.contactos = [];
    this.ultimoId = 0;
  }

  agregar(contacto) {
    this.ultimoId++;
    contacto.id = this.ultimoId;
    this.contactos.push(contacto);
  }

  listar() {
    console.log("\n== Lista de contactos ==");
    console.log("ID  Nombre Completo       Edad  Teléfono       Email");
    this.contactos
      .sort((a, b) => a.apellido.localeCompare(b.apellido) || a.nombre.localeCompare(b.nombre))
      .forEach(c => {
        console.log(`${c.id.toString().padEnd(3)} ${c.getNombreCompleto().padEnd(20)} ${c.edad.toString().padEnd(4)} ${c.telefono.padEnd(13)} ${c.email}`);
      });
  }

  buscar(texto) {
    const t = texto.toLowerCase();
    return this.contactos.filter(c =>
      c.nombre.toLowerCase().includes(t) ||
      c.apellido.toLowerCase().includes(t) ||
      c.email.toLowerCase().includes(t) ||
      c.telefono.includes(texto)
    );
  }

  editar(id, nuevo) {
    const contacto = this.contactos.find(c => c.id === id);
    if (contacto) {
      contacto.nombre = nuevo.nombre ?? contacto.nombre;
      contacto.apellido = nuevo.apellido ?? contacto.apellido;
      contacto.edad = nuevo.edad ?? contacto.edad;
      contacto.telefono = nuevo.telefono ?? contacto.telefono;
      contacto.email = nuevo.email ?? contacto.email;
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

  static async cargar() {
    let agenda = new Agenda();
    try {
      const data = await read(FILE_PATH); 
      const contactos = JSON.parse(data || "[]"); 
      agenda.contactos = contactos.map(c => new Contacto(c.id, c.nombre, c.apellido, c.edad, c.telefono, c.email));
      agenda.ultimoId = agenda.contactos.reduce((max, c) => c.id > max ? c.id : max, 0);
    } catch (err) {
      console.error("Error al cargar la agenda:", err);
      agenda.contactos = [];
      agenda.ultimoId = 0;
    }
    return agenda;
  }

  async guardar() {
    try {
      const data = JSON.stringify(this.contactos, null, 2);
      await write(data, FILE_PATH); 
    } catch (err) {
      console.error("Error al guardar la agenda:", err);
    }
  }
}

// Menu
async function main() {
  let agenda = await Agenda.cargar();
  let opcion = "";

  while (opcion !== "0") {
    console.log("\n=== AGENDA DE CONTACTOS ===");
    console.log("1. Listar");
    console.log("2. Agregar");
    console.log("3. Editar");
    console.log("4. Borrar");
    console.log("5. Buscar");
    console.log("0. Finalizar");

    opcion = await prompt("Ingresar opción :> ");

    switch (opcion) {
      case "1":
        agenda.listar();
        break;

      case "2":
        const nombre = await prompt("Nombre :> ");
        const apellido = await prompt("Apellido :> ");
        const edad = parseInt(await prompt("Edad :> "));
        const tel = await prompt("Teléfono :> ");
        const email = await prompt("Email :> ");
        agenda.agregar(new Contacto(null, nombre, apellido, edad, tel, email));
        console.log("Contacto agregado.");
        break;

      case "3":
        const idEditar = parseInt(await prompt("ID a editar :> "));
        const nuevoNombre = await prompt("Nombre :> ");
        const nuevoApellido = await prompt("Apellido :> ");
        const nuevaEdad = parseInt(await prompt("Edad :> "));
        const nuevoTel = await prompt("Teléfono :> ");
        const nuevoEmail = await prompt("Email :> ");
        if (agenda.editar(idEditar, { nombre: nuevoNombre, apellido: nuevoApellido, edad: nuevaEdad, telefono: nuevoTel, email: nuevoEmail })) {
          console.log("Contacto editado.");
        } else {
          console.log("No existe un contacto con ese ID.");
        }
        break;

      case "4":
        const idBorrar = parseInt(await prompt("ID a borrar :> "));
        const eliminado = agenda.borrar(idBorrar);
        if (eliminado) {
          console.log(`Borrado: ${eliminado.apellido}, ${eliminado.nombre}`);
        } else {
          console.log("No existe un contacto con ese ID.");
        }
        break;

      case "5":
        const texto = await prompt("Buscar :> ");
        const resultados = agenda.buscar(texto);
        if (resultados.length > 0) {
          console.log("\nResultados:");
          resultados.forEach(c => console.log(`${c.id} - ${c.getNombreCompleto()} (${c.telefono})`));
        } else {
          console.log("No se encontraron coincidencias.");
        }
        break;

      case "0":
        console.log("Finalizando...");
        break;

      default:
        console.log("Opción no válida.");
        break;
    }

    await agenda.guardar();
  }
}

main();
