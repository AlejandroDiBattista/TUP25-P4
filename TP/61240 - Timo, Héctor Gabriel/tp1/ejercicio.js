import {prompt, read, write} from './io.js';
const AgendaJSON = "agenda.json";

class Contacto {
  constructor(ID, Nombre, Apellido, edad, Telefono, Email) {
    this.id = ID;
    this.nombre = Nombre;
    this.apellido = Apellido;
    this.edad = edad;
    this.telefono = Telefono;
    this.email = Email;
  }
}

class Agenda {
  constructor(contactos = []) {
    this.contactos = contactos;
  }

  static async CargarUsuario() {
    try {
      const Dato = await read(AgendaJSON);
      const json = JSON.parse(Dato);
      const contactos = json.map(item => new Contacto(
        item.id,
        item.nombre,
        item.apellido,
        item.edad,
        item.telefono,
        item.email
      ));
      return new Agenda(contactos);
    } catch (error) {
      console.error("Error. Se iniciará una agenda vacía.");
      return new Agenda();
    }
  }

  async Guardar() {
    await write(JSON.stringify(this.contactos, null, 2), AgendaJSON);
  }

  async AgregarUsuario() {
    try {
      let proximoID = 1;
      if (this.contactos.length > 0) {
        proximoID = Math.max(...this.contactos.map(c => c.id)) + 1;
      }

      let nombre = await prompt("Ingresa el nombre: ");
      nombre = nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();

      let apellido = await prompt("Ingresa el apellido: ");
      apellido = apellido.charAt(0).toUpperCase() + apellido.slice(1).toLowerCase();

      let edad;
      while (true) {
        const edadStr = await prompt("Ingresa la edad: ");
        edad = parseInt(edadStr);
        if (isNaN(edad) || edad > 120) {
          console.log("Error: La edad debe ser un número válido y no mayor a 120. Intentar Nuevamente.");
        } else {
          break;
        }
      }

      const telefono = await prompt("Ingresa el teléfono: ");
      const email = await prompt("Ingresa el email: ");

      await prompt("Presione Enter para continuar...");

      const nuevoContacto = new Contacto(proximoID, nombre, apellido, edad, telefono, email);
      this.contactos.push(nuevoContacto);
      
      await this.Guardar();

      console.log("Usuario agregado correctamente");
    } catch (error) {
      console.error("Error al agregar un usuario:", error);
    }
  }

  async ListaUsuario() {
    try {
      if (this.contactos.length === 0) {
        console.log("La agenda está vacía. No hay usuarios");
        return;
      }

      console.log(`\n+-----+----------------------+-------+----------------+--------------------------+`);
      console.log(`| ID  | Nombre Completo      | Edad  | Teléfono       | Email                    |`);
      console.log(`+-----+----------------------+-------+----------------+--------------------------+`);

      this.contactos.forEach(contacto => {
        const nombreCompleto = `${contacto.nombre} ${contacto.apellido}`;
        console.log(`| ${String(contacto.id).padEnd(3)} | ${nombreCompleto.padEnd(20)} | ${String(contacto.edad).padEnd(5)} | ${String(contacto.telefono).padEnd(14)} | ${String(contacto.email).padEnd(24)} |`);
      });

      console.log(`+-----+----------------------+-------+----------------+--------------------------+`);
    } catch (error) {
      console.error("Error al mostrar la lista de usuarios:", error);
    }
  }

  async EditarUsuario() {
    try {
      const idStr = await prompt("Ingresa el ID del usuario que desea editar: ");
      const id = parseInt(idStr);

      if (isNaN(id)) {
        console.log("Error: El ID debe ser un número válido.");
        return;
      }

      const contacto = this.contactos.find(c => c.id === id);

      if (!contacto) {
        console.log(`Error: No se encontró ningún usuario con el ID ${id}.`);
        return;
      }

      console.log(`\nEditando usuario con ID ${id}:`);
      console.log(`Nombre actual: ${contacto.nombre} ${contacto.apellido}`);
      console.log(`Edad actual: ${contacto.edad}`);
      console.log(`Teléfono actual: ${contacto.telefono}`);
      console.log(`Email actual: ${contacto.email}\n`);

      let nuevoNombre = await prompt("Ingresa el nuevo nombre (En blanco mantendra el actual): ");
      if (nuevoNombre.trim() !== "") {
        contacto.nombre = nuevoNombre.charAt(0).toUpperCase() + nuevoNombre.slice(1).toLowerCase();
      }

      let nuevoApellido = await prompt("Ingresa el nuevo apellido (En blanco mantendra el actual): ");
      if (nuevoApellido.trim() !== "") {
        contacto.apellido = nuevoApellido.charAt(0).toUpperCase() + nuevoApellido.slice(1).toLowerCase();
      }

      let nuevaEdad;
      while (true) {
        const nuevaEdadStr = await prompt("Ingresa la nueva edad (En blanco mantendra el actual): ");
        if (nuevaEdadStr.trim() === "") {
          nuevaEdad = contacto.edad;
          break;
        }

        nuevaEdad = parseInt(nuevaEdadStr);
        if (isNaN(nuevaEdad) || nuevaEdad > 120) {
          console.log("Error: La edad debe ser un número válido y no mayor a 120. Intentar Nuevamente.");
        } else {
          contacto.edad = nuevaEdad;
          break;
        }
      }

      const nuevoTelefono = await prompt("Ingresa el nuevo teléfono (En blanco mantendra el actual): ");
      if (nuevoTelefono.trim() !== "") {
        contacto.telefono = nuevoTelefono;
      }

      const nuevoEmail = await prompt("Ingresa el nuevo email (En blanco mantendra el actual): ");
      if (nuevoEmail.trim() !== "") {
        contacto.email = nuevoEmail;
      }

      await this.Guardar();

      console.log("Usuario editado correctamente");
    } catch (error) {
      console.error("Error al editar un usuario:", error);
    }
  }

  async BorrarUsuario() {
    try {
      const idStr = await prompt("Ingresa el ID del usuario que desea borrar: ");
      const id = parseInt(idStr);

      if (isNaN(id)) {
        console.log("Error: El ID debe ser un número válido.");
        return;
      }

      const indiceUsuario = this.contactos.findIndex(c => c.id === id);

      if (indiceUsuario === -1) {
        console.log(`Error: No se encontró ningún usuario con el ID ${id}.`);
        return;
      }

      const contacto = this.contactos[indiceUsuario];
      console.log(`\nUsuario seleccionado: ${contacto.nombre} ${contacto.apellido} (ID: ${contacto.id})`);
      const confirmacion = await prompt("¿Está seguro que desea eliminar este usuario? (S/N): ");

      if (confirmacion.trim().toUpperCase() !== 'S') {
        console.log("Cancelado. El usuario no fue borrado.");
        return;
      }

      this.contactos.splice(indiceUsuario, 1);
      await this.Guardar();

      console.log(`Usuario con ID ${id} borrado correctamente`);
    } catch (error) {
      console.error("Error al borrar el usuario:", error);
    }
  }

  async BuscarUsuario() {
    try {
      const textoDeBusqueda = await prompt("Ingresa el ID o el término de búsqueda (nombre, apellido o email): ");
      const ID_Busqueda = parseInt(textoDeBusqueda);
      
      let Resultados = [];
      if (!isNaN(ID_Busqueda)) {
        Resultados = this.contactos.filter(c => c.id === ID_Busqueda);
      } else {
        const terminoNormalizado = textoDeBusqueda.toLowerCase();
        Resultados = this.contactos.filter(c => {
          const nombre = c.nombre || '';
          const apellido = c.apellido || '';
          const telefono = String(c.telefono) || '';
          const email = c.email || '';

          return nombre.toLowerCase().includes(terminoNormalizado) ||
                 apellido.toLowerCase().includes(terminoNormalizado) ||
                 telefono.toLowerCase().includes(terminoNormalizado) ||
                 email.toLowerCase().includes(terminoNormalizado);
        });
      }

      if (Resultados.length === 0) {
        console.log(`No se encontraron usuarios en la busqueda "${textoDeBusqueda}".`);
        return;
      }

      console.log(`\nResultados de la búsqueda para "${textoDeBusqueda}":`);
      console.log(`\n+-----+----------------------+-------+----------------+--------------------------+`);
      console.log(`| ID  | Nombre Completo      | Edad  | Teléfono       | Email                    |`);
      console.log(`+-----+----------------------+-------+----------------+--------------------------+`);

      Resultados.forEach(contacto => {
        const nombreCompleto = `${contacto.nombre} ${contacto.apellido}`;
        console.log(`| ${String(contacto.id).padEnd(3)} | ${nombreCompleto.padEnd(20)} | ${String(contacto.edad).padEnd(5)} | ${String(contacto.telefono).padEnd(14)} | ${String(contacto.email).padEnd(24)} |`);
      });

      console.log(`+-----+----------------------+-------+----------------+--------------------------+`);
    } catch (error) {
      console.error("Error al buscar usuarios:", error);
    }
  }

  async Menu() {
    while (true) {
      console.log(`\n -------------------------`);
      console.log(`|   AGENDA DE CONTACTOS   |`);
      console.log(`|-------------------------|`);
      console.log(`|1. Listar contactos      |`);
      console.log(`|2. Agregar contacto      |`);
      console.log(`|3. Editar contacto       |`);
      console.log(`|4. Borrar contacto       |`);
      console.log(`|5. Buscar contacto       |`);
      console.log(`|6. Salir                 |`);
      console.log(` -------------------------`);
      const opcion = await prompt("Ingrese una opción: ");
      console.clear();

      switch (opcion) {
        case '1':
          await this.ListaUsuario();
          break;
        case '2':
          await this.AgregarUsuario();
          break;
        case '3':
          await this.EditarUsuario();
          break;
        case '4':
          await this.BorrarUsuario();
          break;
        case '5':
          await this.BuscarUsuario();
          break;
        case '6':
          console.log("¡Gracias por usar la Agenda, Chau!");
          process.exit(0);
        default:
          console.log("Opción no valida. Por favor, ingrese un número correcto de opciones");
          break;
      }
      
      if (opcion !== '6') {
        await prompt("\nPresione Enter para regresar al menú...");
      }
    }
  }
}

// Inicio del programa
(async () => {
  const agenda = await Agenda.CargarUsuario();
  await agenda.Menu();
})();

