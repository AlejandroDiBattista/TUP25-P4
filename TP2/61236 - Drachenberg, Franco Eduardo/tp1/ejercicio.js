import { prompt, read, write } from "./io.js";

function color(str, c) {
  const E = "\x1b[";
  const RESET = E + "0m";
  const COLORES = {
    red: E + "31m",
    green: E + "32m",
    blue: E + "34m",
    yellow: E + "33m",
    cyan: E + "36m",
  };
  return `${COLORES[c]}${str}${RESET}`;
}

function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validarEdad(edad) {
  const num = parseInt(edad, 10);
  return !isNaN(num) && num > 0 && num <= 150;
}

function validarTelefono(telefono) {
  // Acepta números con espacios, guiones, paréntesis
  const regex = /^[\d\s\-\(\)\+]+$/;
  return regex.test(telefono) && telefono.replace(/\D/g, "").length >= 7;
}

function validarTextoNoVacio(texto) {
  return texto && texto.trim().length > 0;
}

async function validarPromp(mensaje, validador, mensajeError) {
  while (true) {
    const input = await prompt(mensaje);
    if (validador(input)) {
      return input;
    }
    centerLog(color(mensajeError, "red"));
  }
}
class Contacto {
  #id;
  #nombre;
  #apellido;
  #edad;
  #telefono;
  #email;

  constructor(id, nombre, apellido, edad, telefono, email) {
    this.#id = id;
    this.#nombre = nombre;
    this.#apellido = apellido;
    this.#edad = edad;
    this.#telefono = telefono;
    this.#email = email;
  }

  get id() {
    return this.#id;
  }
  get nombre() {
    return this.#nombre;
  }
  get apellido() {
    return this.#apellido;
  }
  get edad() {
    return this.#edad;
  }
  get telefono() {
    return this.#telefono;
  }
  get email() {
    return this.#email;
  }

  actualizar(datos) {
    this.#nombre = datos.nombre ?? this.#nombre;
    this.#apellido = datos.apellido ?? this.#apellido;
    this.#edad = datos.edad ?? this.#edad;
    this.#telefono = datos.telefono ?? this.#telefono;
    this.#email = datos.email ?? this.#email;
  }

  toJson() {
    return {
      id: this.#id,
      nombre: this.#nombre,
      apellido: this.#apellido,
      edad: this.#edad,
      telefono: this.#telefono,
      email: this.#email,
    };
  }
}

class Agenda {
  #contactos = [];
  #proximoId = 1;

  agregar(nombre, apellido, edad, telefono, email) {
    const nuevoContacto = new Contacto(
      this.#proximoId,
      nombre,
      apellido,
      edad,
      telefono,
      email
    );
    this.#contactos.push(nuevoContacto);
    this.#proximoId++;
  }

  buscarPorId(id) {
    return this.#contactos.find((contacto) => contacto.id === id);
  }

  editar(id, nuevosDatos) {
    const contacto = this.buscarPorId(id);
    contacto?.actualizar(nuevosDatos);
    return !!contacto; // Truthy/Falsy Thinghy, No(No(undefined)) es false
  }

  borrar(id) {
    const index = this.#contactos.findIndex((contacto) => contacto.id === id);
    console.log(index);
    if (index !== -1) {
      this.#contactos.splice(index, 1);
      return true;
    }
    return false;
  }

  listar() {
    return [...this.#contactos].sort((a, b) => {
      const apellidoComp = a.apellido.localeCompare(b.apellido);
      if (apellidoComp !== 0) return apellidoComp;
      return a.nombre.localeCompare(b.nombre);
    });
  }

  buscar(termino) {
    const busqueda = termino.toLowerCase();
    return this.#contactos.filter(function (c) {
      return JSON.stringify(Object.values(c.toJson()))
        .toLowerCase()
        .includes(busqueda);
    });
  }

  toJson() {
    return {
      contactos: this.#contactos.map((c) => c.toJson()),
      proximoId: this.#proximoId,
    };
  }

  static fromJson(json) {
    const agenda = new Agenda();
    if (json && json.contactos) {
      //if no empty e include cnotactos
      agenda.#contactos = json.contactos.map(
        (c) =>
          new Contacto(c.id, c.nombre, c.apellido, c.edad, c.telefono, c.email)
      );
      agenda.#proximoId = json.proximoId || 1;
    }
    return agenda;
  }
}

class Tabla {
  #headers;
  #rows = [];
  #columnWidths;

  constructor(headers) {
    this.#headers = headers;
    this.#columnWidths = headers.map((h) => String(h).length);
  }

  addRow(row) {
    this.#rows.push(row);
    row.forEach((cell, i) => {
      const cellLen = String(cell).length;
      if (cellLen > this.#columnWidths[i]) {
        this.#columnWidths[i] = cellLen;
      }
    });
  }

  padAndTruncate(str, len) {
    str = String(str);
    if (str.length > len) {
      return str.substring(0, len - 3) + "...";
    }
    return str.padEnd(len, " ");
  }

  toString() {
    const termSize = process.stdout.columns || 80;
    let totalWidth = this.#columnWidths.reduce((sum, w) => sum + w + 3, 1);

    if (totalWidth > termSize) {
      const emailColIndex = 4;
      const nameColIndex = 1;
      let excess = totalWidth - termSize;

      if (this.#columnWidths[emailColIndex] > 10 && excess > 0) {
        const reduction = Math.min(
          excess,
          this.#columnWidths[emailColIndex] - 10
        );
        this.#columnWidths[emailColIndex] -= reduction;
        excess -= reduction;
      }
      if (this.#columnWidths[nameColIndex] > 15 && excess > 0) {
        const reduction = Math.min(
          excess,
          this.#columnWidths[nameColIndex] - 15
        );
        this.#columnWidths[nameColIndex] -= reduction;
        excess -= reduction;
      }
    }

    const vline = "─";
    const tDown = "┬";
    const tUp = "┴";
    const tLeft = "├";
    const tRight = "┤";
    const cross = "┼";
    const vLine = "│";
    const tlCorner = "┌";
    const trCorner = "┐";
    const blCorner = "└";
    const brCorner = "┘";

    const buildLine = (left, middle, right, joiner) => {
      return (
        left +
        this.#columnWidths.map((w) => middle.repeat(w + 2)).join(joiner) +
        right
      );
    };

    const topBorder = buildLine(tlCorner, vline, trCorner, tDown);
    const separator = buildLine(tLeft, vline, tRight, cross);
    const bottomBorder = buildLine(blCorner, vline, brCorner, tUp);

    const buildRow = (row) => {
      const cells = row.map((cell, i) =>
        this.padAndTruncate(cell, this.#columnWidths[i])
      );
      return `${vLine} ${cells.join(` ${vLine} `)} ${vLine}`;
    };

    let result = `${topBorder}\n`;
    result += `${buildRow(this.#headers)}\n`;
    result += `${separator}\n`;
    this.#rows.forEach((row) => {
      result += `${buildRow(row)}\n`;
    });
    result += bottomBorder;

    return centerLog(result, false);
  }
}

function vLength(str) {
  // length con color y emojis
  const regex = /\x1b\[[0-9]+m/g; //\x1b[..m
  const cleanedString = str.replace(regex, "");
  /* // Rompe las tablas por algun motivo
  const segmenter = new Intl.Segmenter();
  console.log(cleanedString);
  return [...segmenter.segment(cleanedString)].length;
  */
  return cleanedString.length;
}

function centerLog(message, log = true) {
  const newMsg = [];

  for (let msg of message.split("\n")) {
    newMsg.push(
      " ".repeat(
        Math.max(0, Math.floor((process.stdout.columns - vLength(msg)) / 2))
      ) + msg
    );
  }
  if (log) console.log(newMsg.join("\n"));
  else return newMsg.join("\n");
}

function imprimirContactos(contactos, encabezado) {
  centerLog(color(`\n== ${encabezado} ==`, "yellow"));
  if (contactos.length === 0) {
    centerLog(color("No se encontraron contactos.", "red"));
    return;
  }

  const headers = ["ID", "Nombre completo", "Edad", "Teléfono", "Email"];
  const tabla = new Tabla(headers);

  contactos.forEach((c) => {
    tabla.addRow([
      String(c.id).padStart(2, "0"),
      `${c.apellido}, ${c.nombre}`,
      c.edad,
      c.telefono,
      c.email,
    ]);
  });

  console.log(tabla.toString());
}

async function main() {
  let agenda;
  try {
    // FIX
    const data = await read("./agenda.json");
    agenda = Agenda.fromJson(JSON.parse(data));
  } catch (error) {
    agenda = new Agenda();
  }

  while (true) {
    console.clear();
    centerLog(color("=== AGENDA DE CONTACTOS ===", "blue"));
    const menu = new Tabla(["Opción", "Acción"]);
    menu.addRow(["1", "Listar"]);
    menu.addRow(["2", "Agregar"]);
    menu.addRow(["3", "Editar"]);
    menu.addRow(["4", "Borrar"]);
    menu.addRow(["5", "Buscar"]);
    menu.addRow(["0", "Salir"]);
    console.log(menu.toString());

    const opcion = await prompt(color("\nIngresar opción :> ", "cyan"));

    switch (opcion) {
      case "1": {
        // Listar
        const contactosOrdenados = agenda.listar();
        imprimirContactos(contactosOrdenados, "Lista de contactos");
        break;
      }
      case "2": {
        // Agregar
        centerLog(color("\n== Agregando contacto ==", "yellow"));

        const nombre = await validarPromp(
          color("Nombre      :> ", "cyan"),
          validarTextoNoVacio,
          "El nombre no puede estar vacío."
        );

        const apellido = await validarPromp(
          color("Apellido    :> ", "cyan"),
          validarTextoNoVacio,
          "El apellido no puede estar vacío."
        );

        const edad = await validarPromp(
          color("Edad        :> ", "cyan"),
          validarEdad,
          "La edad debe ser un número entre 1 y 150."
        );

        const telefono = await validarPromp(
          color("Teléfono    :> ", "cyan"),
          validarTelefono,
          "El teléfono debe contener al menos 7 dígitos."
        );

        const email = await validarPromp(
          color("Email       :> ", "cyan"),
          validarEmail,
          "Ingrese un email válido (ejemplo: usuario@dominio.com)."
        );

        agenda.agregar(nombre, apellido, edad, telefono, email);
        // FIX
        await write(JSON.stringify(agenda.toJson(), null, 2), "./agenda.json");
        centerLog(color("\nContacto agregado exitosamente.", "green"));
        break;
      }
      case "3": {
        // Editar
        centerLog(color("\n== Editar contacto ==", "yellow"));
        const idStr = await prompt(color("ID contacto a editar :> ", "cyan"));
        const id = parseInt(idStr, 10);
        const contacto = agenda.buscarPorId(id);

        if (contacto) {
          centerLog(
            color(
              "Editando contacto (deje en blanco para no cambiar):",
              "yellow"
            )
          );
          const nombre =
            (await prompt(color(`Nombre [${contacto.nombre}] :> `, "cyan"))) ||
            contacto.nombre;
          const apellido =
            (await prompt(
              color(`Apellido [${contacto.apellido}] :> `, "cyan")
            )) || contacto.apellido;
          const edad =
            (await prompt(color(`Edad [${contacto.edad}] :> `, "cyan"))) ||
            contacto.edad;
          const telefono =
            (await prompt(
              color(`Teléfono [${contacto.telefono}] :> `, "cyan")
            )) || contacto.telefono;
          const email =
            (await prompt(color(`Email [${contacto.email}] :> `, "cyan"))) ||
            contacto.email;

          agenda.editar(id, { nombre, apellido, edad, telefono, email });
          // FIX
          await write(
            JSON.stringify(agenda.toJson(), null, 2), "./agenda.json");
          centerLog(color("\nContacto actualizado exitosamente.", "green"));
        } else {
          centerLog(color("No se encontró un contacto con ese ID.", "red"));
        }
        break;
      }
      case "4": {
        // Borrar
        centerLog(color("\n== Borrar contacto ==", "yellow"));
        const idStr = await prompt(color("ID contacto a borrar :> ", "cyan"));
        const id = parseInt(idStr, 10);
        const contacto = agenda.buscarPorId(id);

        if (contacto) {
          centerLog(color("Borrando...", "yellow"));
          imprimirContactos([contacto], "Contacto a borrar");
          const confirma = await prompt(
            color("¿Confirma borrado? (S/N) :> ", "cyan")
          );
          if (confirma.toUpperCase() === "S") {
            agenda.borrar(id);
            // FIX
            await write(JSON.stringify(agenda.toJson(), null, 2), "./agenda.json");
            centerLog(color("\nContacto borrado exitosamente.", "green"));
          } else {
            centerLog(color("\nOperación cancelada.", "blue"));
          }
        } else {
          centerLog(color("No se encontró un contacto con ese ID.", "red"));
        }
        break;
      }
      case "5": {
        // Buscar
        centerLog(color("\n== Buscar contacto ==", "yellow"));
        const termino = await prompt(color("Buscar :> ", "cyan"));
        const resultados = agenda.buscar(termino);
        imprimirContactos(resultados, `Resultados para "${termino}"`);
        break;
      }
      case "0": {
        // Salir
        centerLog(color("\nSaliendo de la agenda...", "blue"));
        return;
      }
      default: {
        centerLog(color("Opción no válida. Intente nuevamente.", "red"));
        break;
      }
    }
    if (opcion !== "0") {
      await prompt(color("\nPresione Enter para continuar...", "cyan"));
    }
  }
}

main();
