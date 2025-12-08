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

  getNombreCompleto() {
    return `${this.apellido}, ${this.nombre}`;
  }
}

class Agenda {
  constructor(contactos = [], ultimoId = 0) {
    this.contactos = contactos;
    this.ultimoId = ultimoId;
  }

  static async cargar(archivo = "./agenda.json") {
    const raw = await read(archivo);
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = { ultimoId: 0, contactos: [] };
    }
    return new Agenda(data.contactos ?? [], data.ultimoId ?? 0);
  }

  async guardar(archivo = "./agenda.json") {
    const data = JSON.stringify(
      { ultimoId: this.ultimoId, contactos: this.contactos },
      null,
      2
    );
    await write(data, archivo);
  }

  agregar(contacto) {
    this.ultimoId++;
    contacto.id = this.ultimoId;
    this.contactos.push(contacto);
  }

  listar() {
    console.log("\n== Lista de contactos ==");
    console.log("ID Nombre Completo           Edad   Telefono       Email");
    this.contactos
      .sort((a, b) => {
        if (a.apellido === b.apellido) return a.nombre.localeCompare(b.nombre);
        return a.apellido.localeCompare(b.apellido);
      })
      .forEach(c => {
        console.log(
          `${String(c.id).padStart(2, "0")} ${c.getNombreCompleto().padEnd(20)} ${String(c.edad).padEnd(5)} ${c.telefono.padEnd(12)} ${c.email}`
        );
      });
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

  getById(id) {
    return this.contactos.find(c => c.id === id);
  }

  borrar(id) {
    const i = this.contactos.findIndex(c => c.id === id);
    if (i >= 0) {
      return this.contactos.splice(i, 1)[0];
    }
    return null;
  }
}

async function main() {
  let agenda = await Agenda.cargar();

  let opcion;
  do {
    console.log("\n=== AGENDA DE CONTACTOS ===");
    console.log("1. Listar");
    console.log("2. Agregar");
    console.log("3. Editar");
    console.log("4. Borrar");
    console.log("5. Buscar");
    console.log("0. Finalizar");

    opcion = await prompt("\nIngresar opción :> ");

    switch (opcion) {
      case "1":
        agenda.listar();
        await prompt("\nPresione Enter para continuar...");
        break;

      case "2":
        console.log("\n== Agregando contacto ==");
        const nombre = await prompt("Nombre      :> ");
        const apellido = await prompt("Apellido    :> ");
        const edad = await prompt("Edad        :> ");
        const telefono = await prompt("Telefono    :> ");
        const email = await prompt("Email       :> ");
        agenda.agregar(new Contacto(null, nombre, apellido, edad, telefono, email));
        await agenda.guardar();
        break;

      case "3":
        console.log("\n== Editar contacto ==");
        agenda.listar();
        const idEditar = parseInt(await prompt("\nID contacto :> "));
        let c = agenda.getById(idEditar);
        if (c) {
          c.nombre = (await prompt(`Nombre (${c.nombre}) :> `)) || c.nombre;
          c.apellido = (await prompt(`Apellido (${c.apellido}) :> `)) || c.apellido;
          c.edad = (await prompt(`Edad (${c.edad}) :> `)) || c.edad;
          c.telefono = (await prompt(`Telefono (${c.telefono}) :> `)) || c.telefono;
          c.email = (await prompt(`Email (${c.email}) :> `)) || c.email;
          await agenda.guardar();
          console.log("Contacto actualizado!");
        } else {
          console.log("ID no encontrado.");
        }
        break;

      case "4":
        console.log("\n== Borrar contacto ==");
        agenda.listar();
        const idBorrar = parseInt(await prompt("\nID contacto :> "));
        const borrar = agenda.getById(idBorrar);
        if (borrar) {
          console.log(`Borrando...\n${borrar.id} ${borrar.getNombreCompleto()} ${borrar.edad} ${borrar.telefono} ${borrar.email}`);
          const conf = (await prompt("¿Confirma borrado? (S/N) :> ")).toLowerCase();
          if (conf === "s") {
            agenda.borrar(idBorrar);
            await agenda.guardar();
            console.log("Contacto borrado.");
          }
        } else {
          console.log("ID no encontrado.");
        }
        break;

      case "5":
        console.log("\n== Buscar contacto ==");
        const texto = (await prompt("Buscar      :> ")).toLowerCase();
        const resultados = agenda.buscar(texto);
        console.log("Resultados:");
        resultados.forEach(c => {
          console.log(`${c.id} ${c.getNombreCompleto()} (${c.edad}) - ${c.telefono} - ${c.email}`);
        });
        await prompt("\nPresione Enter para continuar...");
        break;

      case "0":
        console.log("Saliendo...");
        break;

      default:
        console.log("Opción inválida");
    }
  } while (opcion !== "0");
}

main();
