const { prompt } = require("./io.js");
const fs = require("fs");
const path = require("path");

class Contacto {
  constructor(id, nombre, apellido, edad, telefono, email) {
    if (
      id === undefined ||
      nombre === undefined ||
      apellido === undefined ||
      edad === undefined ||
      telefono === undefined ||
      email === undefined
    ) {
      throw new Error("Todos los campos son obligatorios");
    }

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

  agregarContacto(nombre, apellido, edad, telefono, email) {
    const contacto = new Contacto(
      this.nextId++,
      nombre,
      apellido,
      edad,
      telefono,
      email
    );
    this.contactos.push(contacto);
    return contacto;
  }

  listarContactos() {
    return this.contactos.slice().sort((a, b) => {
      const aApe = (a.apellido ?? "").toLowerCase();
      const bApe = (b.apellido ?? "").toLowerCase();
      if (aApe < bApe) return -1;
      if (aApe > bApe) return 1;
      const aNom = (a.nombre ?? "").toLowerCase();
      const bNom = (b.nombre ?? "").toLowerCase();
      if (aNom < bNom) return -1;
      if (aNom > bNom) return 1;
      return 0;
    });
  }

  getContactoPorId(id) {
    return this.contactos.find((c) => c.id === id);
  }

  editarContacto(id, nuevosDatos) {
    const contacto = this.getContactoPorId(id);
    if (!contacto) {
      throw new Error("Contacto no encontrado");
    }

    if (nuevosDatos.nombre) {
      contacto.nombre = nuevosDatos.nombre;
    }
    if (nuevosDatos.apellido) {
      contacto.apellido = nuevosDatos.apellido;
    }
    if (nuevosDatos.edad) {
      contacto.edad = nuevosDatos.edad;
    }
    if (nuevosDatos.telefono) {
      contacto.telefono = nuevosDatos.telefono;
    }
    if (nuevosDatos.email) {
      contacto.email = nuevosDatos.email;
    }
    return contacto;
  }

  borrarContacto(id) {
    const index = this.contactos.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error("Contacto no encontrado");
    }
    const eliminado = this.contactos.splice(index, 1)[0];
    return eliminado;
  }

  buscarContacto(termino) {
    const t = termino.toLowerCase();
    return this.contactos.filter(
      (c) =>
  (c.nombre ?? "").toLowerCase().includes(t) ||
  (c.apellido ?? "").toLowerCase().includes(t) ||
  (c.telefono ?? "").toString().toLowerCase().includes(t) ||
  (c.email ?? "").toLowerCase().includes(t)
    );
  }
  guardarEnArchivo(ruta) {
    const data = {
      nextId: this.nextId,
      contactos: this.contactos,
    };
    fs.writeFileSync(ruta, JSON.stringify(data, null, 2), "utf8");
  }
  cargarDesdeArchivo(ruta) {

    if (!fs.existsSync(ruta)) {
      this.contactos = [];
      this.nextId = 1;
      return;
    }

    const data = fs.readFileSync(ruta, "utf8");
    const parsed = JSON.parse(data);
    this.nextId = parsed.nextId;
    this.contactos = parsed.contactos.map(
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
  }
}

function padRight(str, len) {
  const s = String(str ?? "");
  return s.length >= len ? s.slice(0, len) : s + " ".repeat(len - s.length);
}

function padLeft(str, len) {
  const s = String(str ?? "");
  return s.length >= len ? s.slice(-len) : " ".repeat(len - s.length) + s;
}

function formatID(n) {
  const num = Number(n) || 0;
  return num.toString().padStart(2, "0");
}

function imprimirCabeceraLista() {
  console.log("== Lista de contactos ==");
  console.log("ID Nombre Completo       Edad        Teléfono        Email");
}

function imprimirContactoLinea(c) {
  const id = formatID(c.id);
  const nombreCompleto = padRight(`${c.apellido}, ${c.nombre}`, 20);
  const edad = padLeft(c.edad, 12);
  const tel = padLeft(c.telefono, 16);
  const email = "  " + (c.email ?? "");
  console.log(`${id} ${nombreCompleto}${edad}${tel}${email}`);
}

async function pausar() {
  await prompt("\nPresione Enter para continuar...");
}

async function promptNoVacio(mensaje) {
  while (true) {
    const r = (await prompt(mensaje)).trim();
    if (r) return r;
  }
}

async function promptEnteroPositivo(mensaje) {
  while (true) {
    const s = (await prompt(mensaje)).trim();
    const n = Number.parseInt(s, 10);
    if (Number.isFinite(n) && n > 0) return n;
  }
}

async function main() {
  const agenda = new Agenda();
  const archivo = path.join(__dirname, "agenda.json");

  // Cargar datos si existen
  try {
    agenda.cargarDesdeArchivo(archivo);
  } catch (e) {
    // Si el JSON está vacío o inválido, iniciamos limpio
    agenda.contactos = [];
    agenda.nextId = 1;
  }

  let salir = false;
  while (!salir) {
    console.log("=== AGENDA DE CONTACTOS ===");
    console.log("1. Listar");
    console.log("2. Agregar");
    console.log("3. Editar");
    console.log("4. Borrar ");
    console.log("5. Buscar ");
    console.log("0. Finalizar\n");

    const opcion = await prompt("Ingresar opción :> ");
    console.log("\n-----\n");

    switch (opcion.trim()) {
      case "1": {
        const lista = agenda.listarContactos();
        imprimirCabeceraLista();
        for (const c of lista) imprimirContactoLinea(c);
        await pausar();
        console.log("\n-----\n");
        break;
      }
      case "2": {
        console.log("== Agregando contacto ==");
  const nombre = await promptNoVacio("Nombre      :> ");
  const apellido = await promptNoVacio("Apellido    :> ");
  const edad = await promptEnteroPositivo("Edad        :> ");
  const telefono = await promptNoVacio("Teléfono    :> ");
  const email = await promptNoVacio("Email       :> ");
        try {
          agenda.agregarContacto(nombre, apellido, edad, telefono, email);
          agenda.guardarEnArchivo(archivo);
        } catch (e) {
          console.error("Error:", e.message);
        }
        await pausar();
        console.log("\n-----\n");
        break;
      }
      case "3": {
        console.log("== Editar contacto ==");
        const idStr = await prompt("ID contacto :> ");
        const id = Number.parseInt(idStr, 10);
        const c = agenda.getContactoPorId(id);
        if (!c) {
          console.log("Contacto no encontrado");
          await pausar();
          console.log("\n-----\n");
          break;
        }
        const nombre = await prompt(`Nombre      (${c.nombre}) :> `);
        const apellido = await prompt(`Apellido    (${c.apellido}) :> `);
        const edadStr = await prompt(`Edad        (${c.edad}) :> `);
        const telefono = await prompt(`Teléfono    (${c.telefono}) :> `);
        const email = await prompt(`Email       (${c.email}) :> `);

        const nuevos = {};
        if (nombre) nuevos.nombre = nombre;
        if (apellido) nuevos.apellido = apellido;
        if (edadStr) nuevos.edad = Number.parseInt(edadStr, 10);
        if (telefono) nuevos.telefono = telefono;
        if (email) nuevos.email = email;
        try {
          agenda.editarContacto(id, nuevos);
          agenda.guardarEnArchivo(archivo);
        } catch (e) {
          console.error("Error:", e.message);
        }
        await pausar();
        console.log("\n-----\n");
        break;
      }
      case "4": {
        console.log("== Borrar contacto ==\n");
        const idStr = await prompt("ID contacto :> ");
        const id = Number.parseInt(idStr, 10);
        const c = agenda.getContactoPorId(id);
        if (!c) {
          console.log("Contacto no encontrado");
          await pausar();
          console.log("\n-----\n");
          break;
        }
        console.log("Borrando...");
        imprimirCabeceraLista();
        imprimirContactoLinea(c);
        const conf = (await prompt("\n¿Confirma borrado? :> S/N ")).toUpperCase();
        if (conf === "S") {
          try {
            agenda.borrarContacto(id);
            agenda.guardarEnArchivo(archivo);
          } catch (e) {
            console.error("Error:", e.message);
          }
        } else {
          console.log("Operación cancelada");
        }
        await pausar();
        console.log("\n-----\n");
        break;
      }
      case "5": {
        console.log("== Buscar contacto ==\n");
        const termino = await prompt("Buscar      :> ");
        const resultados = agenda.buscarContacto(termino);
        if (resultados.length) {
          imprimirCabeceraLista();
          for (const c of resultados) imprimirContactoLinea(c);
        } else {
          console.log("Sin resultados");
        }
        await pausar();
        console.log("\n-----\n");
        break;
      }
      case "0": {
        salir = true;
        break;
      }
      default: {
        break;
      }
    }
  }
}
const invoked = process.argv[1] || "";
if (invoked.endsWith("ejercicio.js")) {
  main();
}
