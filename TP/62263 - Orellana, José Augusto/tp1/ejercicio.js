import { prompt, read, write } from './io.js';

class Contacto {
    constructor(id = null, nombre, apellido, edad, telefono, email) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
        this.telefono = telefono;
        this.email = email;
    }
}

class Agenda {
    constructor(contactos = []) {
        this.contactos = contactos;
        this.ultimoId = 0;
    }

    // Agregar un contacto
    agregar(contacto) {
        this.ultimoId += 1;
        contacto.id = this.ultimoId;
        this.contactos.push(contacto);
    }

    // Guardar agenda en archivo json
    async guardar() {
        await write(JSON.stringify(this.contactos, null, 2));
    }

    // Cargar agenda desde archivo json
    static async cargar() {
        let data = await read();
        let contactosJSON = [];

        try {
            contactosJSON = JSON.parse(data);
            if (!Array.isArray(contactosJSON)) contactosJSON = [];
        } catch (error) {
            contactosJSON = [];
        }

        let agenda = new Agenda(contactosJSON);

        // Determinar el último ID para continuar la enumeración
        if (agenda.contactos.length > 0) agenda.ultimoId = Math.max(...agenda.contactos.map(c => c.id));

        return agenda;
    }

    // Listar contactos ordenados por apellido y nombre
    listar() {
        return this.contactos.sort((a, b) => {
            const apellidoComp = a.apellido.toLowerCase().localeCompare(b.apellido.toLowerCase());
            if (apellidoComp !== 0) return apellidoComp;

            return a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase());
        });
    }
}

async function listarContactos(agenda) {
    console.clear();
    console.log('=== Lista de contactos ===');
    
    const lista = agenda.listar();
    if (lista.length === 0) console.log('No hay contactos en la agenda.');
    else {
        console.log(
            `${'ID'.padStart(2,' ')}  ${'Nombre Completo'.padEnd(30,' ')} ${'Edad'.padStart(4,' ')}  ${'Teléfono'.padEnd(13,' ')} ${'Email'}`
        );
        lista.forEach(c => {
            const nombreCompleto = `${c.apellido}, ${c.nombre}`;
            console.log(
                `${String(c.id).padStart(2,'0')}  ${nombreCompleto.padEnd(30,' ')} ${String(c.edad).padStart(4,' ')}  ${String(c.telefono).padEnd(13,' ')} ${c.email ?? ''}`
            );
        });
    }
    await prompt('\n\nPresioná Enter para continuar...');
}

async function agregarContacto(agenda) {
    console.clear();
    console.log('=== Agregar contacto ===');
    
    let c = new Contacto();
    c.nombre   = await prompt('Nombre    :> ');
    c.apellido = await prompt('Apellido  :> ');
    c.edad     = await prompt('Edad      :> ');
    c.telefono = await prompt('Teléfono  :> ');
    c.email    = await prompt('Email     :> ');

    agenda.agregar(c);
    await agenda.guardar();

    console.log('\nContacto agregado correctamente.');
    await prompt('\nPresioná Enter para continuar...');
}

async function editarContacto(agenda) {
    console.clear();
    console.log('=== Editar contacto ===');

    if (!agenda || !Array.isArray(agenda.contactos) || agenda.contactos.length === 0) {
        console.log('No hay contactos para editar.');
        await prompt('\nPresioná Enter para continuar...');
        return;
    }

    // Mostrar contactos (ordenados por apellido/nombre si agenda.listar() lo hace)
    const lista = agenda.listar();
    console.log(
            `${'ID'.padStart(2,' ')}  ${'Nombre Completo'.padEnd(30,' ')} ${'Edad'.padStart(4,' ')}  ${'Teléfono'.padEnd(13,' ')} ${'Email'}`
        );
    lista.forEach(c => {
        const nombreCompleto = `${c.apellido}, ${c.nombre}`;
        console.log(
            `${String(c.id).padStart(2,'0')}  ${nombreCompleto.padEnd(30,' ')} ${String(c.edad).padStart(4,' ')}  ${String(c.telefono).padEnd(13,' ')} ${c.email ?? ''}`
        );
    });

    // Pedimos el ID (no el índice)
    console.log('------------------------------------------------------------');
    const idStr = await prompt('Ingresá el ID del contacto a editar: ');
    const id = Number(idStr);
    if (!Number.isInteger(id) || id <= 0) {
        console.log('ID inválido.');
        await prompt('\nPresioná Enter para continuar...');
        return;
    }

    // Buscamos la posición en el array por id
    const index = agenda.contactos.findIndex(c => Number(c.id) === id);
    if (index === -1) {
        console.log('------------------------------------------------------------');
        console.log(`No se encontró un contacto con ID ${id}.`);
        await prompt('\nPresioná Enter para continuar...');
        return;
    }

    // Obtenemos el contacto actual
    const contacto = agenda.contactos[index];

    // Pedimos nuevos valores; Enter = mantener el actual
    const nuevoNombre   = (await prompt(`Nombre   [${contacto.nombre}] : `)).trim() || contacto.nombre;
    const nuevoApellido = (await prompt(`Apellido [${contacto.apellido}] : `)).trim() || contacto.apellido;

    const edadEntrada   = (await prompt(`Edad     [${contacto.edad}] : `)).trim();
    const nuevaEdad     = (edadEntrada === '') ? contacto.edad : (Number(edadEntrada).toString() === edadEntrada ? Number(edadEntrada) : contacto.edad);

    const nuevoTelefono = (await prompt(`Teléfono [${contacto.telefono}] : `)).trim() || contacto.telefono;
    const nuevoEmail    = (await prompt(`Email   [${contacto.email ?? ''}] : `)).trim() || contacto.email;

    // Actualizamos EN MEMORIA (preservando id y cualquier otra propiedad)
    agenda.contactos[index] = {
        ...contacto,
        nombre: nuevoNombre,
        apellido: nuevoApellido,
        edad: nuevaEdad,
        telefono: nuevoTelefono,
        email: nuevoEmail
    };

    // Persistimos en disco (Agenda.guardar escribe agenda.contactos)
    await agenda.guardar();

    console.log('Contacto editado con éxito.');
    await prompt('\nPresioná Enter para continuar...');
}

async function borrarContacto(agenda) {
    console.clear();
    console.log('=== Borrar contacto ===');

    if (agenda.contactos.length === 0) {
        console.log('No hay contactos para borrar.');
        await prompt('\nPresioná Enter para continuar...');
        return;
    }

    // Mostrar contactos ordenados
    const lista = agenda.listar();
    console.log(
            `${'ID'.padStart(2,' ')}  ${'Nombre Completo'.padEnd(30,' ')} ${'Edad'.padStart(4,' ')}  ${'Teléfono'.padEnd(13,' ')} ${'Email'}`
        );
    lista.forEach(c => {
        const nombreCompleto = `${c.apellido}, ${c.nombre}`;
        console.log(
            `${String(c.id).padStart(2,'0')}  ${nombreCompleto.padEnd(30,' ')} ${String(c.edad).padStart(4,' ')}  ${String(c.telefono).padEnd(13,' ')} ${c.email ?? ''}`
        );
    });

    // Pedir ID del contacto a borrar
    console.log('------------------------------------------------------------');
    const idStr = await prompt('Ingresá el ID del contacto a borrar: ');
    const id = Number(idStr);

    if (!Number.isInteger(id) || id <= 0) {
        console.log('ID inválido.');
        await prompt('\nPresioná Enter para continuar...');
        return;
    }

    const index = agenda.contactos.findIndex(c => c.id === id);

    if (index === -1) {
        console.log('------------------------------------------------------------');
        console.log(`No se encontró un contacto con ID: ${id}.`);
        await prompt('\nPresioná Enter para continuar...');
        return;
    }

    // Confirmación
    console.log('------------------------------------------------------------');
    const confirmar = await prompt(`¿Confirma borrar a ${agenda.contactos[index].nombre} ${agenda.contactos[index].apellido}? (S/N): `);
    if (confirmar.toLocaleLowerCase() === 's') {
        agenda.contactos.splice(index, 1);
        await agenda.guardar();
        console.log('------------------------------------------------------------');
        console.log('Contacto eliminado con éxito.');
    } else {
        console.log('------------------------------------------------------------');
        console.log('Borrado cancelado.');
    }

    await prompt('\nPresioná Enter para continuar...');
}

async function buscarContacto(agenda) {
    console.clear();
    console.log('=== Buscar contacto ===');

    if (agenda.contactos.length === 0) {
        console.log('No hay contactos en la agenda.');
        await prompt('\nPresioná Enter para continuar...');
        return;
    }

    const termino = (await prompt('Ingresá la búsqueda: ')).toLocaleLowerCase();

    console.log('------------------------------------------------------------');

    const resultados = agenda.contactos.filter(c => {
        const contenido = `${c.id} ${c.nombre} ${c.apellido} ${c.edad} ${c.telefono} ${c.email ?? ''}`.toLowerCase();
        return contenido.includes(termino);
    });

    if (resultados.length === 0) console.log('No se encontraron coincidencias.');
    else {
        console.log(
            `${'ID'.padStart(2,' ')}  ${'Nombre Completo'.padEnd(30,' ')} ${'Edad'.padStart(4,' ')}  ${'Teléfono'.padEnd(13,' ')} ${'Email'}`
        );
        resultados.forEach(c => {
            const nombreCompleto = `${c.apellido}, ${c.nombre}`;
            console.log(
                `${String(c.id).padStart(2,'0')}  ${nombreCompleto.padEnd(30,' ')} ${String(c.edad).padStart(4,' ')}  ${String(c.telefono).padEnd(13,' ')} ${c.email ?? ''}`
            );
        });
    }

    await prompt('\nPresiná Enter para continuar...');
}

async function main() {
    let agenda = await Agenda.cargar();

    console.clear();

    let opcion = '';
    while (opcion !== '0') {
        opcion = await mostrarMenu();

        switch(opcion) {
            case '1':
                await listarContactos(agenda);
                break;

            case '2':
                await agregarContacto(agenda);
                break;

            case '3':
                await editarContacto(agenda);
                break;

            case '4':
                await borrarContacto(agenda);
                break;

            case '5':
                await buscarContacto(agenda);
                break;

            case '0':
                console.log('------------------------------------------------------------');
                console.log('Saliendo de la agenda...');
                break;
            default:
                console.log('------------------------------------------------------------');
                console.log('Opción no válida, intentá nuevamente.');
                await prompt('Presioná enter para continuar...');
                break;
        }
    }
}

// Función principal del menú
async function mostrarMenu() {
    console.clear();
    console.log("\n=== AGENDA DE CONTACTOS ===");
    console.log("1. Listar");
    console.log("2. Agregar");
    console.log("3. Editar");
    console.log("4. Borrar");
    console.log("5. Buscar");
    console.log("0. Finalizar");

    console.log('------------------------------------------------------------');

    const opcion = await prompt("Ingresar opción :> ");
    return opcion.trim();
}

main();