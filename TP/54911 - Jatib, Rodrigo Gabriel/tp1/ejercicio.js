import { prompt, read, write } from './io.js';

class Contacto {
    constructor(id = null, nombre = '', apellido = '', edad = 0, telefono = '', email = '') {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
        this.telefono = telefono;
        this.email = email;
    }
}

class Agenda {
    constructor() {
        this.contactos = [];
        this.proximoId = 1;
    }

    agregar(contacto) {
        contacto.id = this.proximoId;
        this.contactos.push(contacto);
        this.proximoId++;
    }

    buscarPorId(id) {
        for (const contacto of this.contactos) {
            if (contacto.id === id) {
                return contacto;
            }
        }
        return undefined;
    }
    
    editar(id, nuevosDatos) {
        const contacto = this.buscarPorId(id);
        if (contacto) {
            contacto.nombre = nuevosDatos.nombre;
            contacto.apellido = nuevosDatos.apellido;
            contacto.edad = nuevosDatos.edad;
            contacto.telefono = nuevosDatos.telefono;
            contacto.email = nuevosDatos.email;
            return true;
        }
        return false;
    }

    borrar(id) {
        const index = this.contactos.findIndex(c => c.id === id);
        if (index > -1) {
            this.contactos.splice(index, 1);
            return true;
        }
        return false;
    }

    listar() {
        const copiaContactos = [...this.contactos];

        copiaContactos.sort((a, b) => {
            const apellidoA = a.apellido.toLowerCase();
            const apellidoB = b.apellido.toLowerCase();
            const nombreA = a.nombre.toLowerCase();
            const nombreB = b.nombre.toLowerCase();

            if (apellidoA < apellidoB) return -1;
            if (apellidoA > apellidoB) return 1;

            if (nombreA < nombreB) return -1;
            if (nombreA > nombreB) return 1;

            return 0;
        });
        return copiaContactos;
    }

    buscar(termino) {
        const resultados = [];
        const terminoMinuscula = termino.toLowerCase();

        for (const contacto of this.listar()) {
            const nombreCompleto = `${contacto.nombre} ${contacto.apellido}`.toLowerCase();
            const email = contacto.email.toLowerCase();
            const telefono = contacto.telefono;

            if (nombreCompleto.includes(terminoMinuscula) || email.includes(terminoMinuscula) || telefono.includes(terminoMinuscula)) {
                resultados.push(contacto);
            }
        }
        return resultados;
    }

    static async cargar(origen = './agenda.json') {
        const agenda = new Agenda();
        try {
            const data = await read(origen);
            if (data) {
                const contactosGuardados = JSON.parse(data);
                let maxId = 0;
                contactosGuardados.forEach(c => {
                    agenda.contactos.push(new Contacto(c.id, c.nombre, c.apellido, c.edad, c.telefono, c.email));
                    if (c.id > maxId) {
                        maxId = c.id;
                    }
                });
                agenda.proximoId = maxId + 1;
            }
        } catch (error) {
        }
        return agenda;
    }

    async guardar(destino = './agenda.json') {
        const data = JSON.stringify(this.contactos, null, 2);
        await write(data, destino);
    }
}

function mostrarContactos(contactos) {
    console.log("\nID Nombre Completo       Edad        Teléfono        Email");
    console.log("---------------------------------------------------------------------------");
    if (contactos.length === 0) {
        console.log("No se encontraron contactos.");
        return;
    }
    contactos.forEach(c => {
        const id = String(c.id).padStart(2, '0');
        const nombreCompleto = `${c.apellido}, ${c.nombre}`.padEnd(20);
        const edad = String(c.edad).padEnd(12);
        const telefono = c.telefono.padEnd(16);
        const email = c.email;
        console.log(`${id} ${nombreCompleto}${edad}${telefono}${email}`);
    });
}

async function presioneEnterParaContinuar() {
    await prompt("\nPresione Enter para continuar...");
}

async function main() {
    let agenda = await Agenda.cargar();
    let salir = false;

    while (!salir) {
        console.clear();
        console.log("=== AGENDA DE CONTACTOS ===");
        console.log("1. Listar");
        console.log("2. Agregar");
        console.log("3. Editar");
        console.log("4. Borrar");
        console.log("5. Buscar");
        console.log("0. Finalizar");

        const opcion = await prompt("\nIngresar opción :> ");

        switch (opcion) {
            case '1': {
                console.clear();
                console.log("== Lista de contactos ==");
                mostrarContactos(agenda.listar());
                await presioneEnterParaContinuar();
                break;
            }
            case '2': {
                console.clear();
                console.log("== Agregando contacto ==");
                const nuevo = new Contacto();
                nuevo.nombre = await prompt("Nombre      :> ");
                nuevo.apellido = await prompt("Apellido    :> ");
                nuevo.edad = parseInt(await prompt("Edad        :> ") || '0');
                nuevo.telefono = await prompt("Teléfono    :> ");
                nuevo.email = await prompt("Email       :> ");
                agenda.agregar(nuevo);
                console.log("\nContacto agregado con éxito.");
                await presioneEnterParaContinuar();
                break;
            }
            case '3': {
                console.clear();
                console.log("== Editar contacto ==");
                const idStr = await prompt("ID contacto :> ");
                const id = parseInt(idStr);
                const contacto = agenda.buscarPorId(id);

                if (contacto) {
                    console.log("\nEditando contacto (deje en blanco para no cambiar):");
                    const nombre = await prompt(`Nombre [${contacto.nombre}] :> `) || contacto.nombre;
                    const apellido = await prompt(`Apellido [${contacto.apellido}] :> `) || contacto.apellido;
                    const edad = parseInt(await prompt(`Edad [${contacto.edad}] :> `) || contacto.edad);
                    const telefono = await prompt(`Teléfono [${contacto.telefono}] :> `) || contacto.telefono;
                    const email = await prompt(`Email [${contacto.email}] :> `) || contacto.email;
                    
                    agenda.editar(id, {nombre, apellido, edad, telefono, email});
                    console.log("\nContacto actualizado.");
                } else {
                    console.log("No se encontró un contacto con ese ID.");
                }
                await presioneEnterParaContinuar();
                break;
            }
            case '4': {
                console.clear();
                console.log("== Borrar contacto ==");
                const idStr = await prompt("ID contacto :> ");
                const id = parseInt(idStr);
                const contacto = agenda.buscarPorId(id);

                if (contacto) {
                    console.log("\nBorrando...");
                    mostrarContactos([contacto]);
                    const confirma = await prompt("\n¿Confirma borrado? (S/N) :> ");
                    if (confirma.toLowerCase() === 's') {
                        agenda.borrar(id);
                        console.log("Contacto borrado.");
                    } else {
                        console.log("Operación cancelada.");
                    }
                } else {
                    console.log("No se encontró un contacto con ese ID.");
                }
                await presioneEnterParaContinuar();
                break;
            }
            case '5': {
                console.clear();
                console.log("== Buscar contacto ==");
                const termino = await prompt("Buscar      :> ");
                const resultados = agenda.buscar(termino);
                console.log("");
                mostrarContactos(resultados);
                await presioneEnterParaContinuar();
                break;
            }
            case '0': {
                await agenda.guardar();
                console.log("\nAgenda guardada.");
                salir = true;
                break;
            }
            default: {
                console.log("Opción no válida. Intente de nuevo.");
                await presioneEnterParaContinuar();
                break;
            }
        }
    }
}

main();


// EJEMPLO DE USO... borrar...
/*let agenda = await Agenda.cargar();

console.log("=== Ingresar nuevo contacto ===");

let c = new Contacto();
c.nombre = await prompt("Nombre :>");
c.edad   = await prompt("Edad   :>");
agenda.agregar(c);

await agenda.guardar();*/