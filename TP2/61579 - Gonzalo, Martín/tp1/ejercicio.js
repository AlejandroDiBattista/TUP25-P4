const fs = require('fs');
const readline = require('readline');

const NOMBRE_DEL_ARCHIVO = 'agenda.json';

// --- Funciones de entrada por consola ---
function preguntar(pregunta) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve =>
    rl.question(pregunta, respuesta => {
      rl.close();
      resolve(respuesta);
    })
  );
}

// --- GESTIÓN DE DATOS ---
function crearGestorDeItems() {
  let items = [];
  let ultimoId = 0;

  function inicializar() {
    try {
      const datos = fs.readFileSync(NOMBRE_DEL_ARCHIVO, 'utf8');
      items = JSON.parse(datos);
      if (items.length > 0) {
        ultimoId = Math.max(...items.map(i => i.id));
      }
      console.log('Agenda cargado desde el archivo.');
    } catch {
      console.log('No se encontró el archivo en la agenda. Creando uno nuevo.');
      items = [];
    }
  }

  function guardar() {
    try {
      fs.writeFileSync(NOMBRE_DEL_ARCHIVO, JSON.stringify(items, null, 2), 'utf8');
      console.log('Agenda guardada con éxito.');
    } catch (e) {
      console.error('Error al guardar en la agenda:', e.message);
    }
  }

  function registrar(datos) {
    const nuevoId = ++ultimoId;
    const nuevoItem = { id: nuevoId, ...datos };
    items.push(nuevoItem);
    console.log(`\nItem para '${nuevoItem.nombre}' agregado`);
  }

  function actualizar(id, datosNuevos) {
    const item = buscarPorId(id);
    if (!item) return false;
    Object.assign(item, datosNuevos);
    console.log(`\nItem con ID ${id} actualizado.`);
    return true;
  }

  function remover(id) {
    const indice = items.findIndex(i => i.id === id);
    if (indice === -1) return false;
    items.splice(indice, 1);
    console.log(`\nItem con ID ${id} eliminado.`);
    return true;
  }

  function buscarPorId(id) {
    return items.find(i => i.id === id);
  }

  function buscarPorTexto(texto) {
    const t = texto.toLowerCase();
    return items.filter(i =>
      i.nombre.toLowerCase().includes(t) ||
      i.apellido.toLowerCase().includes(t) ||
      i.email.toLowerCase().includes(t)
    );
  }

  function obtenerTodos() {
    return [...items].sort((a, b) =>
      `${a.apellido}, ${a.nombre}`.localeCompare(`${b.apellido}, ${b.nombre}`)
    );
  }

  inicializar();
  return { registrar, actualizar, remover, buscarPorId, buscarPorTexto, obtenerTodos, guardar };
}

// --- FORMATEO ---
function formatearItem(item) {
  const nombreCompleto = `${item.apellido}, ${item.nombre}`.padEnd(25);
  return `${item.id.toString().padStart(2, ' ')} | ${nombreCompleto} | ${item.edad.toString().padEnd(5)} | ${item.telefono.padEnd(12)} | ${item.email}`;
}

function mostrarMenu() {
  console.clear();
  console.log('--- AGENDA DE CONTACTOS ---');
  console.log('1. Ver todos los items');
  console.log('2. Registrar nuevo item');
  console.log('3. Actualizar un item');
  console.log('4. Remover un item');
  console.log('5. Buscar en el catálogo');
  console.log('0. Finalizar y guardar');
}

// --- PROGRAMA PRINCIPAL ---
async function main() {
  const gestor = crearGestorDeItems();
  let continuar = true;

  while (continuar) {
    mostrarMenu();
    const eleccion = parseInt(await preguntar('Ingresa tu elección: '), 10);

    switch (eleccion) {
      case 1:
        console.log('\n--- LISTADO DE ITEMS ---');
        console.log('ID | Apellido, Nombre        | Edad  | Teléfono     | Email');
        console.log('--------------------------------------------------------------------------------');
        gestor.obtenerTodos().forEach(item => console.log(formatearItem(item)));
        break;

      case 2:
        const nombre = await preguntar('Nombre: ');
        const apellido = await preguntar('Apellido: ');
        const edad = parseInt(await preguntar('Edad: '), 10);
        const telefono = await preguntar('Teléfono: ');
        const email = await preguntar('Email: ');
        gestor.registrar({ nombre, apellido, edad, telefono, email });
        break;

      case 3:
        const idAct = parseInt(await preguntar('ID del item a actualizar: '), 10);
        const itemAActualizar = gestor.buscarPorId(idAct);
        if (itemAActualizar) {
          const nuevoNombre = await preguntar(`Nuevo nombre (${itemAActualizar.nombre}): `) || itemAActualizar.nombre;
          const nuevoApellido = await preguntar(`Nuevo apellido (${itemAActualizar.apellido}): `) || itemAActualizar.apellido;
          const nuevaEdad = parseInt(await preguntar(`Nueva edad (${itemAActualizar.edad}): `), 10) || itemAActualizar.edad;
          const nuevoTelefono = await preguntar(`Nuevo teléfono (${itemAActualizar.telefono}): `) || itemAActualizar.telefono;
          const nuevoEmail = await preguntar(`Nuevo email (${itemAActualizar.email}): `) || itemAActualizar.email;
          gestor.actualizar(idAct, { nombre: nuevoNombre, apellido: nuevoApellido, edad: nuevaEdad, telefono: nuevoTelefono, email: nuevoEmail });
        } else {
          console.log('\nItem no encontrado.');
        }
        break;

      case 4:
        const idRem = parseInt(await preguntar('ID del item a remover: '), 10);
        const conf = await preguntar(`Confirmar remoción del ID ${idRem} (s/n): `);
        if (conf.toLowerCase() === 's') {
          gestor.remover(idRem);
        } else {
          console.log('Operación cancelada.');
        }
        break;

      case 5:
        const texto = await preguntar('Texto a buscar: ');
        const resultados = gestor.buscarPorTexto(texto);
        if (resultados.length === 0) {
          console.log('\nNo se encontraron coincidencias.');
        } else {
          console.log('\n--- RESULTADOS DE BÚSQUEDA ---');
          console.log('ID | Apellido, Nombre        | Edad  | Teléfono     | Email');
          console.log('--------------------------------------------------------------------------------');
          resultados.forEach(item => console.log(formatearItem(item)));
        }
        break;

      case 0:
        gestor.guardar();
        console.log('¡Hasta pronto!');
        continuar = false;
        break;

      default:
        console.log('Opción inválida.');
        break;
    }

    if (continuar) {
      await preguntar('\nPresiona Enter para continuar...');
    }
  }
}

main();