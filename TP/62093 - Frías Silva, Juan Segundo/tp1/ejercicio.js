const fs = require("fs");
const readline = require("readline-sync");

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

  getNombreCompleto() {
    return `${this.apellido}, ${this.nombre}`;
  }
}

// ===== Clase Agenda =====
class Agenda {
  constructor(archivo = "agenda.json") {
    this.contactos = [];
    this.archivo = archivo;
    this.lastId = 0;
    this.cargar();
  }

  // Agregar contacto
  agregarContacto(nombre, apellido, edad, telefono, email) {
    this.lastId++;
    const contacto = new Contacto(this.lastId, nombre, apellido, edad, telefono, email);
    this.contactos.push(contacto);
    this.guardar();
    console.log("\nContacto agregado con éxito.");
  }

  // Editar contacto
  editarContacto(id, nuevosDatos) {
    const contacto = this.contactos.find(c => c.id === id);
    if (!contacto) {
      console.log("Contacto no encontrado.");
      return;
    }
    Object.assign(contacto, nuevosDatos);
    this.guardar();
    console.log("\nContacto actualizado con éxito.");
  }

  // Borrar contacto
  borrarContacto(id) {
    const index = this.contactos.findIndex(c => c.id === id);
    if (index === -1) {
      console.log("Contacto no encontrado.");
      return;
    }
    const contacto = this.contactos[index];
    console.log(`\nBorrando... ${contacto.getNombreCompleto()}`);
    const confirmar = readline.question("¿Confirma borrado? (S/N): ").toUpperCase();
    if (confirmar === "S") {
      this.contactos.splice(index, 1);
      this.guardar();
      console.log("Contacto borrado.");
    }
  }

  // Listar contactos
  listarContactos() {
    console.log("\n== Lista de contactos ==");
    console.log("ID  Nombre Completo            Edad  Teléfono       Email");
    console.log("--------------------------------------------------------------");
    this.contactos
      .sort((a, b) => a.apellido.localeCompare(b.apellido) || a.nombre.localeCompare(b.nombre))
      .forEach(c => {
        console.log(
          `${c.id.toString().padStart(2, "0")}  ${c.getNombreCompleto().padEnd(22)}  ${c.edad.toString().padEnd(4)}  ${c.telefono.padEnd(12)}  ${c.email}`
        );
      });
  }

  // Buscar contactos
  buscarContactos(termino) {
    const resultados = this.contactos.filter(c =>
      Object.values(c).some(v => String(v).toLowerCase().includes(termino.toLowerCase()))
    );
    if (resultados.length === 0) {
      console.log("\nNo se encontraron contactos.");
      return;
    }
    console.log("\nResultados de búsqueda:");
    console.log("ID  Nombre Completo            Edad  Teléfono       Email");
    console.log("--------------------------------------------------------------");
    resultados.forEach(c => {
      console.log(
        `${c.id.toString().padStart(2, "0")}  ${c.getNombreCompleto().padEnd(22)}  ${c.edad.toString().padEnd(4)}  ${c.telefono.padEnd(12)}  ${c.email}`
      );
    });
  }

  // Guardar en archivo JSON
  guardar() {
    fs.writeFileSync(this.archivo, JSON.stringify({ lastId: this.lastId, contactos: this.contactos }, null, 2));
  }

  // Cargar desde archivo JSON
  cargar() {
    if (fs.existsSync(this.archivo)) {
      const data = JSON.parse(fs.readFileSync(this.archivo));
      this.lastId = data.lastId || 0;
      this.contactos = data.contactos.map(c => new Contacto(c.id, c.nombre, c.apellido, c.edad, c.telefono, c.email));
    }
  }
}

// ===== Programa principal =====
function main() {
  const agenda = new Agenda();

  let opcion;
  do {
    console.log("\n=== AGENDA DE CONTACTOS ===");
    console.log("1. Listar");
    console.log("2. Agregar");
    console.log("3. Editar");
    console.log("4. Borrar");
    console.log("5. Buscar");
    console.log("0. Finalizar");

    opcion = readline.questionInt("Ingresar opción :> ");

    switch (opcion) {
      case 1:
        agenda.listarContactos();
        break;
      case 2:
        console.log("\n== Agregando contacto ==");
        const nombre = readline.question("Nombre    :> ");
        const apellido = readline.question("Apellido  :> ");
        const edad = readline.questionInt("Edad      :> ");
        const telefono = readline.question("Teléfono  :> ");
        const email = readline.question("Email     :> ");
        agenda.agregarContacto(nombre, apellido, edad, telefono, email);
        break;
      case 3:
        const idEditar = readline.questionInt("ID contacto a editar: ");
        console.log("Dejar en blanco si no desea modificar.");
        const nuevoNombre = readline.question("Nuevo nombre    :> ");
        const nuevoApellido = readline.question("Nuevo apellido  :> ");
        const nuevaEdad = readline.question("Nueva edad      :> ");
        const nuevoTel = readline.question("Nuevo teléfono  :> ");
        const nuevoEmail = readline.question("Nuevo email     :> ");
        agenda.editarContacto(idEditar, {
          nombre: nuevoNombre || undefined,
          apellido: nuevoApellido || undefined,
          edad: nuevaEdad ? parseInt(nuevaEdad) : undefined,
          telefono: nuevoTel || undefined,
          email: nuevoEmail || undefined
        });
        break;
      case 4:
        const idBorrar = readline.questionInt("ID contacto a borrar: ");
        agenda.borrarContacto(idBorrar);
        break;
      case 5:
        const termino = readline.question("Buscar :> ");
        agenda.buscarContactos(termino);
        break;
      case 0:
        console.log("Saliendo...");
        break;
      default:
        console.log("Opción inválida.");
    }
    if (opcion !== 0) readline.question("\nPresione Enter para continuar...");
  } while (opcion !== 0);
}

main();
