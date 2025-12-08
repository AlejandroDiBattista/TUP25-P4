import { prompt, read, write } from './io.js';

class Contacto {
    constructor(id = null, nombre = '', apellido = '', edad = '', telefono = '', email = '') {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
        this.telefono = telefono;
        this.email = email;
    }

    toString() {
        return `${this.id.toString().padStart(2, '0')} ${this.apellido}, ${this.nombre}${' '.repeat(Math.max(1, 20 - (this.apellido + ', ' + this.nombre).length))}${this.edad.toString().padStart(8)}${' '.repeat(Math.max(1, 16 - this.telefono.length))}${this.telefono}${' '.repeat(Math.max(1, 8))}${this.email}`;
    }

    contiene(texto) {
        const busqueda = texto.toLowerCase();
        return this.nombre.toLowerCase().includes(busqueda) ||
               this.apellido.toLowerCase().includes(busqueda) ||
               this.telefono.toLowerCase().includes(busqueda) ||
               this.email.toLowerCase().includes(busqueda);
    }
}

class Agenda {
    constructor() {
        this.contactos = [];
        this.proximoId = 1;
    }

    agregar(contacto) {
        contacto.id = this.proximoId++;
        this.contactos.push(contacto);
    }

    editar(id, nuevoContacto) {
        const index = this.contactos.findIndex(c => c.id === id);
        if (index !== -1) {
            nuevoContacto.id = id;
            this.contactos[index] = nuevoContacto;
            return true;
        }
        return false;
    }

    borrar(id) {
        const index = this.contactos.findIndex(c => c.id === id);
        if (index !== -1) {
            return this.contactos.splice(index, 1)[0];
        }
        return null;
    }

    buscar(texto) {
        return this.contactos.filter(c => c.contiene(texto));
    }

    listar() {
        return [...this.contactos].sort((a, b) => {
            if (a.apellido !== b.apellido) {
                return a.apellido.localeCompare(b.apellido);
            }
            return a.nombre.localeCompare(b.nombre);
        });
    }

    obtenerPorId(id) {
        return this.contactos.find(c => c.id === id);
    }

    static async cargar() {
        const agenda = new Agenda();
        try {
            const data = await read();
            const contactosData = JSON.parse(data);
            
            if (Array.isArray(contactosData) && contactosData.length > 0) {
                agenda.contactos = contactosData.map(c => 
                    new Contacto(c.id, c.nombre, c.apellido, c.edad, c.telefono, c.email)
                );
                agenda.proximoId = Math.max(...agenda.contactos.map(c => c.id)) + 1;
            }
        } catch (error) {
        }
        return agenda;
    }

    async guardar() {
        const data = JSON.stringify(this.contactos, null, 2);
        await write(data);
    }
}

// SISTEMA PRINCIPAL
async function mostrarMenu() {
    console.log("\n=== AGENDA DE CONTACTOS ===");
    console.log("1. Listar");
    console.log("2. Agregar");
    console.log("3. Editar");
    console.log("4. Borrar");
    console.log("5. Buscar");
    console.log("0. Finalizar");
}

async function mostrarContactos(contactos) {
    if (contactos.length === 0) {
        console.log("No hay contactos para mostrar.");
        return;
    }
    
    console.log("ID Nombre Completo       Edad        Teléfono        Email");
    contactos.forEach(contacto => {
        console.log(contacto.toString());
    });
}

async function esperarEnter() {
    await prompt("\nPresione Enter para continuar...");
}

async function agregarContacto(agenda) {
    console.log("\n== Agregando contacto ==");
    
    const nombre = await prompt("Nombre      :> ");
    const apellido = await prompt("Apellido    :> ");
    const edad = await prompt("Edad        :> ");
    const telefono = await prompt("Teléfono    :> ");
    const email = await prompt("Email       :> ");
    
    const contacto = new Contacto(null, nombre, apellido, edad, telefono, email);
    agenda.agregar(contacto);
    await agenda.guardar();
    
    console.log("Contacto agregado exitosamente.");
}

async function editarContacto(agenda) {
    console.log("\n== Editar contacto ==");
    
    const contactos = agenda.listar();
    if (contactos.length === 0) {
        console.log("No hay contactos para editar.");
        return;
    }
    
    console.log("\n== Lista de contactos ==");
    await mostrarContactos(contactos);
    
    const idStr = await prompt("\nID contacto :> ");
    const id = parseInt(idStr);
    
    const contactoExistente = agenda.obtenerPorId(id);
    if (!contactoExistente) {
        console.log("Contacto no encontrado.");
        return;
    }
    
    console.log("\nEditando...");
    console.log(contactoExistente.toString());
    console.log("\nIngrese los nuevos datos (Enter para mantener el actual):");
    
    const nombre = await prompt(`Nombre      [${contactoExistente.nombre}] :> `) || contactoExistente.nombre;
    const apellido = await prompt(`Apellido    [${contactoExistente.apellido}] :> `) || contactoExistente.apellido;
    const edad = await prompt(`Edad        [${contactoExistente.edad}] :> `) || contactoExistente.edad;
    const telefono = await prompt(`Teléfono    [${contactoExistente.telefono}] :> `) || contactoExistente.telefono;
    const email = await prompt(`Email       [${contactoExistente.email}] :> `) || contactoExistente.email;
    
    const nuevoContacto = new Contacto(null, nombre, apellido, edad, telefono, email);
    agenda.editar(id, nuevoContacto);
    await agenda.guardar();
    
    console.log("Contacto editado exitosamente.");
}

async function borrarContacto(agenda) {
    console.log("\n== Borrar contacto ==");
    
    const contactos = agenda.listar();
    if (contactos.length === 0) {
        console.log("No hay contactos para borrar.");
        return;
    }
    
    const idStr = await prompt("\nID contacto :> ");
    const id = parseInt(idStr);
    
    const contacto = agenda.obtenerPorId(id);
    if (!contacto) {
        console.log("Contacto no encontrado.");
        return;
    }
    
    console.log("\nBorrando...");
    console.log("ID Nombre Completo       Edad        Teléfono        Email");
    console.log(contacto.toString());
    
    const confirmacion = await prompt("\n¿Confirma borrado? :> S/N ");
    if (confirmacion.toLowerCase() === 's') {
        agenda.borrar(id);
        await agenda.guardar();
        console.log("Contacto borrado exitosamente.");
    } else {
        console.log("Operación cancelada.");
    }
}

async function buscarContacto(agenda) {
    console.log("\n== Buscar contacto ==");
    
    const busqueda = await prompt("\nBuscar      :> ");
    const resultados = agenda.buscar(busqueda);
    
    if (resultados.length === 0) {
        console.log("No se encontraron contactos.");
        return;
    }
    
    console.log("\nID Nombre Completo       Edad        Teléfono        Email");
    resultados.sort((a, b) => {
        if (a.apellido !== b.apellido) {
            return a.apellido.localeCompare(b.apellido);
        }
        return a.nombre.localeCompare(b.nombre);
    }).forEach(contacto => {
        console.log(contacto.toString());
    });
}

async function listarContactos(agenda) {
    console.log("\n== Lista de contactos ==");
    const contactos = agenda.listar();
    await mostrarContactos(contactos);
}

// PROGRAMA PRINCIPAL
async function main() {
    const agenda = await Agenda.cargar();
    
    while (true) {
        await mostrarMenu();
        const opcion = await prompt("\nIngresar opción :> ");
        
        console.log("\n-----");
        
        switch (opcion) {
            case '1':
                await listarContactos(agenda);
                await esperarEnter();
                break;
            case '2':
                await agregarContacto(agenda);
                await esperarEnter();
                break;
            case '3':
                await editarContacto(agenda);
                await esperarEnter();
                break;
            case '4':
                await borrarContacto(agenda);
                await esperarEnter();
                break;
            case '5':
                await buscarContacto(agenda);
                await esperarEnter();
                break;
            case '0':
                console.log("¡Hasta luego!");
                return;
            default:
                console.log("Opción no válida.");
                await esperarEnter();
                break;
        }
    }
}

// Ejecutar la aplicación
main().catch(console.error); 