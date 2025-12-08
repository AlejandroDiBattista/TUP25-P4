import {prompt, read, write} from './io.js';

class Contacto {
    constructor(id = 0, nombre = '', apellido = '', edad = 0, telefono = '', email = '') {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
        this.telefono = telefono;
        this.email = email;
    }

    toString() {
        const nombreCompleto = `${this.apellido}, ${this.nombre}`;
        return `${String(this.id).padStart(2, '0')} ${nombreCompleto.padEnd(20)} ${String(this.edad).padEnd(10)} ${this.telefono.padEnd(15)} ${this.email}`;
    }

    contiene(termino) {
        const term = termino.toLowerCase();
        return (
            this.nombre.toLowerCase().includes(term) ||
            this.apellido.toLowerCase().includes(term) ||
            this.telefono.includes(term) ||
            this.email.toLowerCase().includes(term)
        );
    }
}

class Agenda {
    constructor() {
        this.contactos = [];
        this.siguienteId = 1;
    }

    agregar(nombre, apellido, edad, telefono, email) {
        const contacto = new Contacto(this.siguienteId, nombre, apellido, edad, telefono, email);
        this.contactos.push(contacto);
        this.siguienteId++;
        return contacto;
    }

    buscarPorId(id) {
        return this.contactos.find(c => c.id === id);
    }

    editar(id, nombre, apellido, edad, telefono, email) {
        const contacto = this.buscarPorId(id);
        if (contacto) {
            contacto.nombre = nombre;
            contacto.apellido = apellido;
            contacto.edad = edad;
            contacto.telefono = telefono;
            contacto.email = email;
            return true;
        }
        return false;
    }

    borrar(id) {
        const index = this.contactos.findIndex(c => c.id === id);
        if (index !== -1) {
            this.contactos.splice(index, 1);
            return true;
        }
        return false;
    }

    listar() {
        return [...this.contactos].sort((a, b) => {
            const apellidoCmp = a.apellido.toLowerCase().localeCompare(b.apellido.toLowerCase());
            if (apellidoCmp !== 0) return apellidoCmp;
            return a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase());
        });
    }

    buscar(termino) {
        return this.contactos
            .filter(c => c.contiene(termino))
            .sort((a, b) => {
                const apellidoCmp = a.apellido.toLowerCase().localeCompare(b.apellido.toLowerCase());
                if (apellidoCmp !== 0) return apellidoCmp;
                return a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase());
            });
    }

    static async cargar() {
        const agenda = new Agenda();
        try {
            const data = await read();
            const json = JSON.parse(data);
            agenda.siguienteId = json.siguienteId || 1;
            agenda.contactos = (json.contactos || []).map(c => 
                new Contacto(c.id, c.nombre, c.apellido, c.edad, c.telefono, c.email)
            );
        } catch (error) {
            // Si no existe o está vacío, iniciar con agenda vacía
            agenda.contactos = [];
            agenda.siguienteId = 1;
        }
        return agenda;
    }

    async guardar() {
        const data = {
            siguienteId: this.siguienteId,
            contactos: this.contactos.map(c => ({
                id: c.id,
                nombre: c.nombre,
                apellido: c.apellido,
                edad: c.edad,
                telefono: c.telefono,
                email: c.email
            }))
        };
        await write(JSON.stringify(data, null, 2));
    }
}

// ========== FUNCIONES DE LA APLICACIÓN ==========

function mostrarMenu() {
    console.log("\n" + "=".repeat(30));
    console.log("=== AGENDA DE CONTACTOS ===");
    console.log("=".repeat(30));
    console.log("1. Listar");
    console.log("2. Agregar");
    console.log("3. Editar");
    console.log("4. Borrar");
    console.log("5. Buscar");
    console.log("0. Finalizar");
    console.log("=".repeat(30));
}

async function pausar() {
    await prompt("\nPresione Enter para continuar...");
}

async function listarContactos(agenda) {
    console.log("\n" + "-".repeat(30));
    console.log("== Lista de contactos ==");
    const contactos = agenda.listar();
    
    if (contactos.length === 0) {
        console.log("\nNo hay contactos en la agenda.");
    } else {
        console.log(`${'ID'.padEnd(2)} ${'Nombre Completo'.padEnd(20)} ${'Edad'.padEnd(10)} ${'Teléfono'.padEnd(15)} Email`);
        console.log("-".repeat(70));
        contactos.forEach(c => console.log(c.toString()));
    }
    
    await pausar();
}

async function agregarContacto(agenda) {
    console.log("\n" + "-".repeat(30));
    console.log("== Agregando contacto ==");
    
    const nombre = await prompt("Nombre      :> ");
    const apellido = await prompt("Apellido    :> ");
    const edad = parseInt(await prompt("Edad        :> "));
    const telefono = await prompt("Teléfono    :> ");
    const email = await prompt("Email       :> ");
    
    if (!nombre || !apellido) {
        console.log("\nError: Nombre y apellido son obligatorios.");
        await pausar();
        return;
    }
    
    if (isNaN(edad)) {
        console.log("\nError: La edad debe ser un número.");
        await pausar();
        return;
    }
    
    const contacto = agenda.agregar(nombre, apellido, edad, telefono, email);
    await agenda.guardar();
    console.log(`\n✓ Contacto agregado exitosamente con ID: ${String(contacto.id).padStart(2, '0')}`);
    
    await pausar();
}

async function editarContacto(agenda) {
    console.log("\n" + "-".repeat(30));
    console.log("== Editar contacto ==");
    
    const id = parseInt(await prompt("\nID contacto :> "));
    const contacto = agenda.buscarPorId(id);
    
    if (!contacto) {
        console.log(`\nError: No se encontró contacto con ID ${String(id).padStart(2, '0')}`);
        await pausar();
        return;
    }
    
    console.log("\nContacto actual:");
    console.log(`${'ID'.padEnd(2)} ${'Nombre Completo'.padEnd(20)} ${'Edad'.padEnd(10)} ${'Teléfono'.padEnd(15)} Email`);
    console.log("-".repeat(70));
    console.log(contacto.toString());
    
    console.log("\nIngrese los nuevos datos (Enter para mantener el valor actual):");
    
    let nombre = await prompt(`Nombre      [${contacto.nombre}] :> `);
    let apellido = await prompt(`Apellido    [${contacto.apellido}] :> `);
    let edadStr = await prompt(`Edad        [${contacto.edad}] :> `);
    let telefono = await prompt(`Teléfono    [${contacto.telefono}] :> `);
    let email = await prompt(`Email       [${contacto.email}] :> `);
    
    // Usar valores actuales si no se ingresó nada
    nombre = nombre || contacto.nombre;
    apellido = apellido || contacto.apellido;
    const edad = edadStr ? parseInt(edadStr) : contacto.edad;
    telefono = telefono || contacto.telefono;
    email = email || contacto.email;
    
    agenda.editar(id, nombre, apellido, edad, telefono, email);
    await agenda.guardar();
    console.log("\n✓ Contacto actualizado exitosamente.");
    
    await pausar();
}

async function borrarContacto(agenda) {
    console.log("\n" + "-".repeat(30));
    console.log("== Borrar contacto ==");
    
    const id = parseInt(await prompt("\nID contacto :> "));
    const contacto = agenda.buscarPorId(id);
    
    if (!contacto) {
        console.log(`\nError: No se encontró contacto con ID ${String(id).padStart(2, '0')}`);
        await pausar();
        return;
    }
    
    console.log("\nBorrando...");
    console.log(`${'ID'.padEnd(2)} ${'Nombre Completo'.padEnd(20)} ${'Edad'.padEnd(10)} ${'Teléfono'.padEnd(15)} Email`);
    console.log("-".repeat(70));
    console.log(contacto.toString());
    
    const confirmacion = (await prompt("\n¿Confirma borrado? (S/N) :> ")).toUpperCase();
    
    if (confirmacion === 'S') {
        agenda.borrar(id);
        await agenda.guardar();
        console.log("\n✓ Contacto borrado exitosamente.");
    } else {
        console.log("\nOperación cancelada.");
    }
    
    await pausar();
}

async function buscarContacto(agenda) {
    console.log("\n" + "-".repeat(30));
    console.log("== Buscar contacto ==");
    
    const termino = await prompt("\nBuscar      :> ");
    
    if (!termino) {
        console.log("\nError: Debe ingresar un término de búsqueda.");
        await pausar();
        return;
    }
    
    const resultados = agenda.buscar(termino);
    
    if (resultados.length === 0) {
        console.log(`\nNo se encontraron contactos que contengan '${termino}'.`);
    } else {
        console.log(`\n${'ID'.padEnd(2)} ${'Nombre Completo'.padEnd(20)} ${'Edad'.padEnd(10)} ${'Teléfono'.padEnd(15)} Email`);
        console.log("-".repeat(70));
        resultados.forEach(c => console.log(c.toString()));
    }
    
    await pausar();
}

// ========== PROGRAMA PRINCIPAL ==========

async function main() {
    const agenda = await Agenda.cargar();
    
    while (true) {
        mostrarMenu();
        
        const opcion = await prompt("\nIngresar opción :> ");
        
        switch (opcion) {
            case "1":
                await listarContactos(agenda);
                break;
            case "2":
                await agregarContacto(agenda);
                break;
            case "3":
                await editarContacto(agenda);
                break;
            case "4":
                await borrarContacto(agenda);
                break;
            case "5":
                await buscarContacto(agenda);
                break;
            case "0":
                console.log("\n¡Hasta luego!");
                process.exit(0);
            default:
                console.log("\nOpción inválida. Intente nuevamente.");
                await pausar();
        }
    }
}

main().catch(console.error); 