const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let contactos = [
  { nombre: "Perez", telefono: "1234" },
  { nombre: "Lopez", telefono: "5678" },
  { nombre: "Gomez", telefono: "9876" }
];

function mostrarMenu() {
  console.log("\n=== AGENDA DE CONTACTOS ===");
  console.log("1. Listar");
  console.log("2. Agregar");
  console.log("3. Editar");
  console.log("4. Borrar");
  console.log("5. Buscar");
  console.log("0. Finalizar");
  rl.question("Ingresar opción: ", manejarOpcion);
}

function manejarOpcion(opcion) {
  switch (opcion) {
    case "1": // LISTAR
      console.log("\n--- Contactos ---");
      if (contactos.length === 0) {
        console.log("No hay contactos cargados.");
      } else {
        contactos.forEach((c, i) => console.log(`${i + 1}. ${c.nombre} - ${c.telefono}`));
      }
      mostrarMenu();
      break;

    case "2": // AGREGAR
      rl.question("Nombre: ", (nombre) => {
        rl.question("Teléfono: ", (telefono) => {
          contactos.push({ nombre, telefono });
          console.log("Contacto agregado!");
          mostrarMenu();
        });
      });
      break;

    case "3": // EDITAR
      rl.question("Ingrese número de contacto a editar: ", (num) => {
        let index = parseInt(num) - 1;
        if (index >= 0 && index < contactos.length) {
          rl.question("Nuevo nombre: ", (nombre) => {
            rl.question("Nuevo teléfono: ", (telefono) => {
              contactos[index] = { nombre, telefono };
              console.log("Contacto editado!");
              mostrarMenu();
            });
          });
        } else {
          console.log("Número inválido.");
          mostrarMenu();
        }
      });
      break;

    case "4": // BORRAR
      rl.question("Ingrese número de contacto a borrar: ", (num) => {
        let index = parseInt(num) - 1;
        if (index >= 0 && index < contactos.length) {
          contactos.splice(index, 1);
          console.log("Contacto borrado!");
        } else {
          console.log("Número inválido.");
        }
        mostrarMenu();
      });
      break;

    case "5": // BUSCAR
      rl.question("Ingrese nombre a buscar: ", (buscado) => {
        let resultados = contactos.filter(c => c.nombre.toLowerCase().includes(buscado.toLowerCase()));
        if (resultados.length > 0) {
          console.log("\nResultados:");
          resultados.forEach(c => console.log(`${c.nombre} - ${c.telefono}`));
        } else {
          console.log("No se encontró ningún contacto.");
        }
        mostrarMenu();
      });
      break;

    case "0": // SALIR
      console.log("Chau!");
      rl.close();
      break;

    default:
      console.log("Opción inválida");
      mostrarMenu();
  }
}

mostrarMenu();
