import { prompt, read, write } from "./io.js";

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
  set nombre(nombre) {
    this.#nombre = nombre;
  }
  set apellido(apellido) {
    this.#apellido = apellido;
  }
  set edad(edad) {
    this.#edad = edad;
  }
  set telefono(telefono) {
    this.#telefono = telefono;
  }
  set email(email) {
    this.#email = email;
  }

  static async crearDesdePrompt() {
    let nombre = await prompt("Nombre :>");
    let apellido = await prompt("Apellido :>");
    let edad = await prompt("Edad :>");
    let telefono = await prompt("Teléfono :>");
    let email = await prompt("Email :>");
    const c = new Contacto(null, nombre, apellido, edad, telefono, email);
    return c;
  }
  toJSON() {
    return {
      id: this.#id,
      apellido: this.#apellido,
      nombre: this.#nombre,
      edad: this.#edad,
      telefono: this.#telefono,
      email: this.#email,
    };
  }

  toString() {
    return `${this.#id} ${this.#nombre} ${this.#apellido} ${this.#edad} ${this.#telefono} ${this.#email}`;
  }
}

class Agenda {
  contactos = [];

  constructor(contactos = []) {
    this.contactos = contactos.map(
      (c) =>
        new Contacto(c.id, c.nombre, c.apellido, c.edad, c.telefono, c.email)
    );
  }

  async agregar(contacto) {

    const ultimoId =
      this.contactos.length > 0
        ? this.contactos[this.contactos.length - 1].id
        : 0;

    const nuevoContacto = new Contacto(
      ultimoId + 1,
      contacto.nombre,
      contacto.apellido,
      contacto.edad,
      contacto.telefono,
      contacto.email
    );

    this.contactos.push(nuevoContacto);
    await this.guardar();

    console.log("Contacto agregado:", nuevoContacto.toJSON());
  }

  static async cargar() {
    try {
      const data = await read();
      const contactos = JSON.parse(data);
      return new Agenda(contactos);
    } catch (e) {
      return new Agenda();
    }
  }
  async guardar() {
    await write(JSON.stringify(this.contactos, null, 2));
  }

  async mostrarOpciones() {
    console.log("=== AGENDA DE CONTACTOS ===");
    console.log("=== OPCIONES ===");
    console.log("1. Listar");
    console.log("2. Agregar");
    console.log("3. Editar");
    console.log("4. Borrar");
    console.log("5. Buscar");
    console.log("0. Finalizar");

    let opcion = await prompt("Ingresar número de la opción: ");

    switch (opcion) {
      case "1":
        let agendaVer = await Agenda.cargar();
        console.table(agendaVer.contactos.map((c) => c.toJSON()));
        await prompt("Presione Enter para continuar...");
        agendaVer.mostrarOpciones();
        break;

      case "2":
        let agendaCrear = await Agenda.cargar();
        const c = await Contacto.crearDesdePrompt();
        await agendaCrear.agregar(c);
        await prompt("Presione Enter para continuar...");
        agendaCrear.mostrarOpciones();
        break;

      case "3":
        let agendaEditar = await Agenda.cargar();
        let idEditar = await prompt(
          "Ingrese el id del contacto que desea editar: "
        );
        let contactoEditar = agendaEditar.contactos.find(
          (c) => c.id == parseInt(idEditar)
        );
        if (contactoEditar) {
          contactoEditar.nombre = await prompt(
            `Nombre [${contactoEditar.nombre}]: `
          );
          contactoEditar.apellido = await prompt(
            `Apellido [${contactoEditar.apellido}]: `
          );
          contactoEditar.edad = await prompt(`Edad [${contactoEditar.edad}]: `);
          contactoEditar.telefono = await prompt(
            `Teléfono [${contactoEditar.telefono}]: `
          );
          contactoEditar.email = await prompt(
            `Email [${contactoEditar.email}]: `
          );
          await agendaEditar.guardar();
          console.log("Contacto editado:", contactoEditar.toJSON());
          await prompt("Presione Enter para continuar...");
          agendaEditar.mostrarOpciones();
        } else if (!contactoEditar) {
          console.log("Contacto no encontrado");
          await prompt("Presione Enter para continuar...");
          agendaEditar.mostrarOpciones();
        }
        break;

      case "4":
        let agendaBorrar = await Agenda.cargar();
        let idBorrar = await prompt(
          "Ingrese el id del contacto que desea borrar: "
        );
        let contactoBorrar = await agendaBorrar.contactos.find(
          (c) => c.id == parseInt(idBorrar)
        );

        console.log(
          `Contacto que desea borrar: id:${contactoBorrar.id.toString()} - nombre completo: ${contactoBorrar.nombre.toString()} ${contactoBorrar.apellido.toString()} - edad: ${contactoBorrar.edad.toString()} - teléfono: ${contactoBorrar.telefono.toString()} - email: ${contactoBorrar.email.toString()}`
        );
        let decision = await prompt("Confirmar borrado? :> S/N");
        if (decision.toUpperCase() === "S") {
          if (contactoBorrar) {
            agendaBorrar.contactos = agendaBorrar.contactos.filter(
              (c) => c.id != parseInt(idBorrar)
            );
            await agendaBorrar.guardar();
            console.log("Contacto borrado:", contactoBorrar.toJSON());
          }
        } else if (decision.toUpperCase() === "N") {
          console.log("Operación cancelada.");
        }
        await prompt("Presione Enter para continuar...");
        agendaBorrar.mostrarOpciones();
        break;

      case "5":
        let agendaBuscar = await Agenda.cargar();
        let termino = await prompt("Buscar contacto: ");
        let resultados = agendaBuscar.contactos.filter(
          (c) =>
            c.nombre.toUpperCase().includes(termino.toUpperCase()) ||
            c.apellido.toUpperCase().includes(termino.toUpperCase()) ||
            c.telefono.includes(termino)
        );        
        if (resultados.length > 0) {
          console.table(resultados.map((c) => c.toJSON()));
        } else {
          console.log("No se encontraron resultados.");
        }
        await prompt("Presione Enter para continuar...");
        agendaBuscar.mostrarOpciones();
        break;

      case "0":
        console.log("Cerrando agenda...");
        setTimeout(() => {
          console.log("...");
        }, 500);
        setTimeout(() => {
          console.log("...");
        }, 1000);
        setTimeout(() => {
          console.log("...");
        }, 1500);
        setTimeout(() => {
          console.log("¡Agenda cerrada con éxito!");
        }, 2000);
        break;
    }
  }
}

let agenda = new Agenda();
agenda.mostrarOpciones();
