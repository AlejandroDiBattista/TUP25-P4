const fs = require("fs");
const readline = require("readline");

// ===== Clase Contacto =====
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

// ===== Clase Agenda =====
class Agenda {
  constructor(archivo = "agenda.json") {
    this.archivo = archivo;
    this.contactos = [];
    this.cargar();
  }

  cargar() {
    if (fs.existsSync(this.archivo)) {
      const data = fs.readFileSync(this.archivo, "utf-8");
      this.contactos = JSON.parse(data).map(
        c => new Contacto(c.id, c.nombre, c.apellido, c.edad, c.telefono, c.email)
      );
    }
  }

  guardar() {
    fs.writeFileSync(this.archivo, JSON.stringify(this.contactos, null, 2));
  }

  obtenerSiguienteId() {
    if (this.contactos.length === 0) return 1;
    return Math.max(...this.contactos.map(c => c.id)) + 1;
  }

  agregar(nombre, apellido, edad, telefono, email) {
    const id = this.obtenerSiguienteId();
    const contacto = new Contacto(id, nombre, apellido, edad, telefono, email);
    this.contactos.push(contacto);
    this.guardar();
    console.log("Contacto agregado con ID", id);
  }

  listar(lista = null) {
    const contactos = lista || this.contactos;
    if (contactos.length === 0) {
      console.log("No hay contactos para mostrar.");
      return;
    }
    const ordenados = contactos.sort((a, b) => {
      if (a.apellido === b.apellido) return a.nombre.localeCompare(b.nombre);
      return a.apellido.localeCompare(b.apellido);
    });
    console.log("\nID Nombre Completo        Edad  Teléfono       Email");
    ordenados.forEach(c => {
      const nombreCompleto = `${c.apellido}, ${c.nombre}`;
      console.log(
        `${String(c.id).padStart(2, "0")} ${nombreCompleto.padEnd(20)} ${String(c.edad).padEnd(5)} ${c.telefono.padEnd(12)} ${c.email}`
      );
    });
  }

  buscar(termino) {
    termino = termino.toLowerCase();
    return this.contactos.filter(c =>
      c.nombre.toLowerCase().includes(termino) ||
      c.apellido.toLowerCase().includes(termino) ||
      c.email.toLowerCase().includes(termino) ||
      c.telefono.includes(termino)
    );
  }

  editar(id, datos) {
    const contacto = this.contactos.find(c => c.id === id);
    if (!contacto) return false;
    contacto.nombre = datos.nombre || contacto.nombre;
    contacto.apellido = datos.apellido || contacto.apellido;
    contacto.edad = datos.edad || contacto.edad;
    contacto.telefono = datos.telefono || contacto.telefono;
    contacto.email = datos.email || contacto.email;
    this.guardar();
    return true;
  }

  borrar(id) {
    const idx = this.contactos.findIndex(c => c.id === id);
    if (idx === -1) return null;
    const borrado = this.contactos.splice(idx, 1)[0];
    this.guardar();
    return borrado;
  }
}

// ===== Interfaz por consola =====
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function preguntar(p) {
  return new Promise(resolve => rl.question(p, r => resolve(r)));
}

async function menu() {
  const agenda = new Agenda();

  while (true) {
    console.log("\n=== AGENDA DE CONTACTOS ===");
    console.log("1. Listar");
    console.log("2. Agregar");
    console.log("3. Editar");
    console.log("4. Borrar");
    console.log("5. Buscar");
    console.log("0. Finalizar");

    const opcion = await preguntar("Ingresar opción: ");

    switch (opcion) {
      case "1":
        console.log("\n== Lista de contactos ==");
        agenda.listar();
        await preguntar("Presione Enter para continuar...");
        break;

      case "2":
        console.log("\n== Agregar contacto ==");
        const nombre = await preguntar("Nombre: ");
        const apellido = await preguntar("Apellido: ");
        const edad = parseInt(await preguntar("Edad: "));
        const telefono = await preguntar("Teléfono: ");
        const email = await preguntar("Email: ");
        agenda.agregar(nombre, apellido, edad, telefono, email);
        await preguntar("Presione Enter para continuar...");
        break;

      case "3":
        console.log("\n== Editar contacto ==");
        const idEdit = parseInt(await preguntar("ID contacto: "));
        const datos = {};
        datos.nombre = await preguntar("Nuevo Nombre (ENTER para dejar igual): ");
        datos.apellido = await preguntar("Nuevo Apellido: ");
        const edadStr = await preguntar("Nueva Edad: ");
        datos.edad = edadStr ? parseInt(edadStr) : null;
        datos.telefono = await preguntar("Nuevo Teléfono: ");
        datos.email = await preguntar("Nuevo Email: ");
        const ok = agenda.editar(idEdit, datos);
        console.log(ok ? "Contacto actualizado." : "Contacto no encontrado.");
        await preguntar("Presione Enter para continuar...");
        break;

      case "4":
        console.log("\n== Borrar contacto ==");
        const idBorrar = parseInt(await preguntar("ID contacto: "));
        const contacto = agenda.contactos.find(c => c.id === idBorrar);
        if (!contacto) {
          console.log("Contacto no encontrado.");
        } else {
          console.log(`Borrando... ${contacto.apellido}, ${contacto.nombre}`);
          const conf = await preguntar("¿Confirma borrado? (S/N): ");
          if (conf.toLowerCase() === "s") {
            agenda.borrar(idBorrar);
            console.log("Contacto borrado.");
          } else {
            console.log("Borrado cancelado.");
          }
        }
        await preguntar("Presione Enter para continuar...");
        break;

      case "5":
        console.log("\n== Buscar contacto ==");
        const termino = await preguntar("Buscar: ");
        const resultados = agenda.buscar(termino);
        agenda.listar(resultados);
        await preguntar("Presione Enter para continuar...");
        break;

      case "0":
        console.log("Finalizando...");
        rl.close();
        return;

      default:
        console.log("Opción inválida.");
        await preguntar("Presione Enter para continuar...");
    }
  }
}

menu();
