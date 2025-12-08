import { prompt, read, write } from "./io.js"

class Contacto {
  constructor(nombre, apellido, edad, telefono, email, id) {
    this.nombre = nombre
    this.apellido = apellido
    this.edad = edad
    this.telefono = telefono
    this.email = email
    this.id = id
  }
}

class Agenda {
  constructor() {
    this.contactos = []
    this.ultimoId = 0
  }

  static async cargar() {
    let contactos = await read("./agenda.json")
    if (!Array.isArray(contactos)) {
      contactos = [];
    }

    let agenda = new Agenda();
    agenda.contactos = contactos;
    agenda.ultimoId = contactos.reduce(
      (max, c) => (c.id > max ? c.id : max),
      0
    );
    return agenda
  }

  async guardar() {
    await write(JSON.stringify(this.contactos, null, 2))
  }

  async agregar() {
    let nombre = await prompt("Nombre :>")
    let apellido = await prompt("Apellido :>")
    let edad = await prompt("Edad :>")
    let telefono = await prompt("Teléfono :>")
    let email = await prompt("Email :>")

    this.ultimoId++
    let nuevoContacto = new Contacto(
      nombre,
      apellido,
      edad,
      telefono,
      email,
      this.ultimoId
    )

    this.contactos.push(nuevoContacto)

    await this.guardar()

    console.log("")
    console.log("================================")
    console.log("Contacto agregado exitosamente: ")
    console.log(
      "ID".padEnd(2),
      "Nombre Completo".padEnd(20),
      "Edad".padEnd(8),
      "Teléfono".padEnd(15),
      "Email".padEnd(30)
    );
    console.log(
      String(nuevoContacto.id).padEnd(2),
      `${nuevoContacto.apellido}, ${nuevoContacto.nombre}`.padEnd(20),
      String(nuevoContacto.edad).padEnd(8),
      String(nuevoContacto.telefono).padEnd(15),
      nuevoContacto.email.padEnd(30)
    );
    console.log("================================")
    console.log("")
  }

  async listarContacto() {
    if (this.contactos.length === 0) {
      console.log("No hay contactos en la agenda.")
      console.log("")
    } else {
      let ordenados = [...this.contactos].sort((a, b) => {
        if (a.apellido === b.apellido) {
          return a.nombre.localeCompare(b.nombre)
        }
        return a.apellido.localeCompare(b.apellido)
      });

      console.log(
        "ID".padEnd(2),
        "Nombre Completo".padEnd(20),
        "Edad".padEnd(8),
        "Teléfono".padEnd(15),
        "Email".padEnd(30)
      );
      for (let contacto of ordenados) {
        console.log(
          String(contacto.id).padEnd(2),
          `${contacto.apellido}, ${contacto.nombre}`.padEnd(20),
          String(contacto.edad).padEnd(8),
          String(contacto.telefono).padEnd(15),
          contacto.email.padEnd(30)
        );
      }
    }
  }

  async buscarContacto() {
    function normalizar(texto) {
      return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    }

    if (this.contactos.length === 0) {
      console.log("No hay contactos en la agenda.")
      console.log("")
    } else {
      let busqueda = await prompt("Buscar :>")
      let busquedaNorm = normalizar(busqueda);

      let resultados = this.contactos.filter((c) =>
        normalizar(
          `${c.nombre} ${c.apellido} ${c.email} ${c.telefono} ${c.edad}`
        ).includes(busquedaNorm)
      );

      console.log("");
      console.log("=== RESULTADOS DE LA BUSQUEDA ===")
      if (resultados.length === 0) {
        console.log("No se encontraron resultados.")
      } else {
        console.log(
          "ID".padEnd(2),
          "Nombre Completo".padEnd(20),
          "Edad".padEnd(8),
          "Teléfono".padEnd(15),
          "Email".padEnd(30)
        );
        for (let contacto of resultados) {
          console.log(
            String(contacto.id).padEnd(2),
            `${contacto.apellido}, ${contacto.nombre}`.padEnd(20),
            String(contacto.edad).padEnd(8),
            String(contacto.telefono).padEnd(15),
            contacto.email.padEnd(30)
          );
          console.log("")
        }
      }
    }
  }

  async editarContacto() {
    if (this.contactos.length === 0) {
      console.log("No hay contactos en la agenda.")
      console.log("")
    } else {
      let id = await prompt("Ingrese el ID del contacto a editar:")
      let contacto = this.contactos.find((c) => c.id === parseInt(id))
      if (!contacto) {
        console.log("Contacto no encontrado")
        console.log("")
      } else {
        console.log("")
        console.log("Datos actuales del contacto:")
        console.log(
          "ID".padEnd(2),
          "Nombre Completo".padEnd(20),
          "Edad".padEnd(8),
          "Teléfono".padEnd(15),
          "Email".padEnd(30)
        )
        console.log(
          String(contacto.id).padEnd(2),
          `${contacto.apellido}, ${contacto.nombre}`.padEnd(20),
          String(contacto.edad).padEnd(8),
          String(contacto.telefono).padEnd(15),
          contacto.email.padEnd(30)
        )

        let confirmacion
        do {
          confirmacion = await prompt(
            "¿Está seguro de editar este contacto? (s/n)"
          );
          if (confirmacion.toLowerCase() === "s") {
            let nuevoNombre = await prompt("Ingrese el nuevo nombre: ")
            let nuevoApellido = await prompt("Ingrese el nuevo apellido: ")
            let nuevaEdad = await prompt("Ingrese la nueva edad: ")
            let nuevoTelefono = await prompt("Ingrese el nuevo teléfono: ")
            let nuevoEmail = await prompt("Ingrese el nuevo email: ")

            contacto.nombre = nuevoNombre
            contacto.apellido = nuevoApellido
            contacto.edad = nuevaEdad
            contacto.telefono = nuevoTelefono
            contacto.email = nuevoEmail

            await this.guardar()

            console.log("");
            console.log("===============================")
            console.log("Contacto editado exitosamente:")
            console.log(
              "ID".padEnd(2),
              "Nombre Completo".padEnd(20),
              "Edad".padEnd(8),
              "Teléfono".padEnd(15),
              "Email".padEnd(30)
            );
            console.log(
              String(contacto.id).padEnd(2),
              `${contacto.apellido}, ${contacto.nombre}`.padEnd(20),
              String(contacto.edad).padEnd(8),
              String(contacto.telefono).padEnd(15),
              contacto.email.padEnd(30)
            );
            console.log("===============================")
            console.log("")
            break;
          } else if (confirmacion.toLowerCase() === "n") {
            console.log("")
            console.log("Edición cancelada.")
            console.log("")
            break;
          } else {
            console.log("")
            console.log("Ingreso inválido. Por favor ingrese 's' o 'n'.")
            console.log("")
          }
        } while (true)
      }
    }
  }

  async eliminarContacto() {
    if (this.contactos.length === 0) {
      console.log("No hay contactos en la agenda.")
      console.log("")
    } else {
      let id = await prompt("Ingrese el ID del contacto a eliminar:")
      let contacto = this.contactos.find((c) => c.id === parseInt(id))
      if (!contacto) {
        console.log("Contacto no encontrado")
        console.log("")
      } else {
        console.log("")
        console.log("Eliminando Contacto...")
        console.log(
          "ID".padEnd(2),
          "Nombre Completo".padEnd(20),
          "Edad".padEnd(8),
          "Teléfono".padEnd(15),
          "Email".padEnd(30)
        );
        console.log(
          String(contacto.id).padEnd(2),
          `${contacto.apellido}, ${contacto.nombre}`.padEnd(20),
          String(contacto.edad).padEnd(8),
          String(contacto.telefono).padEnd(15),
          contacto.email.padEnd(30)
        );
        let confirmacion;
        do {
          confirmacion = await prompt(
            "Está seguro de eliminar este contacto? (s/n)"
          )
          if (confirmacion.toLowerCase() === "s") {
            this.contactos = this.contactos.filter(
              (c) => c.id !== parseInt(id)
            )

            await this.guardar()

            console.log("")
            console.log("================================")
            console.log("Contacto eliminado exitosamente")
            console.log("================================")
            console.log("")
            break
          } else if (confirmacion.toLowerCase() === "n") {
            console.log("")
            console.log("Eliminación cancelada.")
            console.log("")
            break
          } else {
            console.log("")
            console.log("Ingreso inválido. Por favor ingrese 's' o 'n'.")
            console.log("")
          }
        } while (true)
      }
    }
  }
}
let agenda = await Agenda.cargar();

let opcion;

do {
  opcion = await prompt(`
=== AGENDA DE CONTACTOS ===
1. Listar Contactos
2. Agregar Contacto
3. Buscar Contacto
4. Editar Contacto
5. Eliminar Contacto
6. Salir
Seleccione una opcion :>
`);

  switch (opcion) {
    case "1":
      console.log("=== LISTA DE CONTACTOS ===");
      await agenda.listarContacto();
      await prompt("Presione Enter para continuar...");
      break;
    case "2":
      console.log("=== AGREGAR CONTACTO ===");
      await agenda.agregar();
      await prompt("Presione Enter para continuar...");
      break;
    case "3":
      console.log("=== BUSCAR CONTACTO ===");
      await agenda.buscarContacto();
      await prompt("Presione Enter para continuar...");
      break;
    case "4":
      console.log("=== EDITAR CONTACTO ===");
      await agenda.editarContacto();
      await prompt("Presione Enter para continuar...");
      break;
    case "5":
      console.log("=== ELIMINAR CONTACTO ===");
      await agenda.eliminarContacto();
      await prompt("Presione Enter para continuar...");
      break;
    case "6":
      console.log("=== SALIENDO ===");
      break;
    default:
      console.log("Opción Invalida");
      await prompt("Presione Enter para continuar...");
      break;
  }
} while (opcion !== "6");
