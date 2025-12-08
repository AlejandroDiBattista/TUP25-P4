import { prompt, read, write } from "./io.js";

const fs = require("fs");
const readline = require("readline");

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
}

class Agenda {
  constructor(ruta = "agenda.json") {
    this.ruta = ruta;
    this.contactos = [];
    this.nextId = 1;
    this.cargar();
  }

  cargar() {
    if (fs.existsSync(this.ruta)) {
      const datos = JSON.parse(fs.readFileSync(this.ruta, "utf-8"));
      this.nextId = datos.nextId;
      this.contactos = datos.contactos.map(
        (c) =>
          new Contacto(c.id, c.nombre, c.apellido, c.edad, c.telefono, c.email)
      );
    }
  }

  guardar() {
    fs.writeFileSync(
      this.ruta,
      JSON.stringify(
        {
          nextId: this.nextId,
          contactos: this.contactos,
        },
        null,
        2
      ),
      "utf-8"
    );
  }

  listar() {
    return this.contactos.sort(
      (a, b) =>
        a.apellido.localeCompare(b.apellido) || a.nombre.localeCompare(b.nombre)
    );
  }

  agregar(nombre, apellido, edad, telefono, email) {
    const c = new Contacto(
      this.nextId++,
      nombre,
      apellido,
      edad,
      telefono,
      email
    );
    this.contactos.push(c);
    this.guardar();
  }

  buscar(texto) {
    texto = texto.toLowerCase();
    return this.contactos.filter(
      (c) =>
        c.nombre.toLowerCase().includes(texto) ||
        c.apellido.toLowerCase().includes(texto)
    );
  }
}

const rl = readline.createInterface(process.stdin, process.stdout);
const agenda = new Agenda();

function prompt(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  let opcion;
  do {
    console.log(`
=== AGENDA DE CONTACTOS ===
1. Listar
2. Agregar
3. Buscar
0. Salir
`);
    opcion = await prompt("Opción: ");

    if (opcion === "1") {
      console.log("\n== Lista de Contactos ==");
      agenda
        .listar()
        .forEach((c) =>
          console.log(
            `${String(c.id).padStart(2, "0")} ${c.nombreCompleto} — ${
              c.edad
            } — ${c.telefono} — ${c.email}`
          )
        );
    } else if (opcion === "2") {
      const nombre = await prompt("Nombre: ");
      const apellido = await prompt("Apellido: ");
      const edad = await prompt("Edad: ");
      const telefono = await prompt("Teléfono: ");
      const email = await prompt("Email: ");
      agenda.agregar(nombre, apellido, parseInt(edad), telefono, email);
      console.log("Contacto agregado.");
    } else if (opcion === "3") {
      const term = await prompt("Buscar: ");
      console.log("\n== Resultados ==");
      agenda
        .buscar(term)
        .forEach((c) =>
          console.log(
            `${String(c.id).padStart(2, "0")} ${c.nombreCompleto} — ${
              c.edad
            } — ${c.telefono} — ${c.email}`
          )
        );
    }

    if (opcion !== "0") await prompt("Presione Enter para continuar...");
  } while (opcion !== "0");

  console.log("¡Hasta pronto!");
  rl.close();
}

main();
