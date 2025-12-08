import { Agenda, Contacto } from './agenda.js';
import { prompt } from './io.js';

// Funciones de color ANSI
const colors = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  gray: "\x1b[90m",
  bold: "\x1b[1m",
};

function titulo(texto) {
  console.log(colors.cyan + colors.bold + "\n=== " + texto + " ===" + colors.reset);
  console.log("=".repeat(60));
}

function imprimirTabla(contactos) {
  const header = [
    "ID".padEnd(4),
    "Apellido, Nombre".padEnd(25),
    "Edad".padEnd(6),
    "Teléfono".padEnd(15),
    "Email".padEnd(30)
  ].join(" ");

  console.log(colors.yellow + header + colors.reset);
  console.log("-".repeat(60));

  contactos.forEach(c => {
    const fila = [
      c.id.toString().padStart(2, '0').padEnd(4),
      `${c.apellido}, ${c.nombre}`.padEnd(25),
      String(c.edad).padEnd(6),
      c.telefono.padEnd(15),
      c.email.padEnd(30)
    ].join(" ");
    console.log(fila);
  });
}

async function mostrarMenu() {
  console.clear();
  console.log(colors.cyan + colors.bold + "=== AGENDA DE CONTACTOS ===" + colors.reset);
  console.log(colors.yellow + "1." + colors.reset + " Listar");
  console.log(colors.yellow + "2." + colors.reset + " Agregar");
  console.log(colors.yellow + "3." + colors.reset + " Editar");
  console.log(colors.yellow + "4." + colors.reset + " Borrar");
  console.log(colors.yellow + "5." + colors.reset + " Buscar");
  console.log(colors.red + "0." + colors.reset + " Finalizar");
  console.log("-".repeat(40));

  const opcion = await prompt(colors.green + "Ingresar opción :> " + colors.reset);

  const agenda = await Agenda.cargar();

  switch (opcion) {
    case '1':
      console.clear();
      titulo("Lista de contactos");
      imprimirTabla(agenda.contactos.sort((a, b) =>
        a.apellido.localeCompare(b.apellido) || a.nombre.localeCompare(b.nombre)
      ));
      await prompt(colors.gray + "\nPresione Enter para continuar..." + colors.reset);
      break;

    case '2':
      console.clear();
      titulo("Agregando contacto");
      const nombre = await prompt('Nombre      :> ');
      const apellido = await prompt('Apellido    :> ');
      const edad = await prompt('Edad        :> ');
      const telefono = await prompt('Teléfono    :> ');
      const email = await prompt('Email       :> ');
      const contacto = new Contacto(agenda.siguienteId++, nombre, apellido, edad, telefono, email);
      agenda.agregar(contacto);
      console.log(colors.green + "\n✔ Contacto agregado." + colors.reset);
      await prompt(colors.gray + "\nPresione Enter para continuar..." + colors.reset);
      break;

    case '3':
      console.clear();
      titulo("Editar contacto");
      const idEditar = await prompt('ID contacto :> ');
      const nuevoNombre = await prompt('Nuevo Nombre      :> ');
      const nuevoApellido = await prompt('Nuevo Apellido    :> ');
      const nuevaEdad = await prompt('Nueva Edad        :> ');
      const nuevoTelefono = await prompt('Nuevo Teléfono    :> ');
      const nuevoEmail = await prompt('Nuevo Email       :> ');
      agenda.editar(parseInt(idEditar), nuevoNombre, nuevoApellido, nuevaEdad, nuevoTelefono, nuevoEmail);
      console.log(colors.green + "\n✔ Contacto actualizado." + colors.reset);
      await prompt(colors.gray + "\nPresione Enter para continuar..." + colors.reset);
      break;

    case '4':
      console.clear();
      titulo("Borrar contacto");
      const idBorrar = await prompt('ID contacto :> ');
      const contactoBorrar = agenda.contactos.find(c => c.id === parseInt(idBorrar));
      if (contactoBorrar) {
        console.log(colors.yellow + `\nBorrando...\n${contactoBorrar.mostrar()}` + colors.reset);
        const confirmacion = await prompt('¿Confirma borrado? (S/N):> ');
        if (confirmacion.toUpperCase() === 'S') {
          agenda.borrar(parseInt(idBorrar));
          console.log(colors.red + "\n✔ Contacto borrado." + colors.reset);
        } else {
          console.log(colors.gray + "\n❌ Borrado cancelado." + colors.reset);
        }
      } else {
        console.log(colors.red + "\n⚠ Contacto no encontrado." + colors.reset);
      }
      await prompt(colors.gray + "\nPresione Enter para continuar..." + colors.reset);
      break;

    case '5':
      console.clear();
      titulo("Buscar contacto");
      const terminoBusqueda = await prompt('Buscar      :> ');
      const resultados = agenda.contactos.filter(c =>
        c.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        c.apellido.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        c.telefono.includes(terminoBusqueda) ||
        c.email.includes(terminoBusqueda)
      );
      if (resultados.length > 0) {
        imprimirTabla(resultados);
      } else {
        console.log(colors.red + "\n⚠ No se encontraron contactos." + colors.reset);
      }
      await prompt(colors.gray + "\nPresione Enter para continuar..." + colors.reset);
      break;

    case '0':
      console.log(colors.green + "\nFinalizando..." + colors.reset);
      return;

    default:
      console.log(colors.red + "\n⚠ Opción no válida" + colors.reset);
      break;
  }

  await agenda.guardar();
  mostrarMenu();
}

mostrarMenu();
