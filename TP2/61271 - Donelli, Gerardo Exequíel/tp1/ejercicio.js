import { prompt, read, write } from './io.js';

class Contacto {
    constructor({ id, nombre, apellido, edad, telefono, email }) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
        this.telefono = telefono;
        this.email = email;
    }
    get nombreCompleto() {
        return `${this.apellido}, ${this.nombre}`;
    }
}

class Agenda {
    constructor() {
        this.contactos = [];
        this.ultimoId = 0;
    }

    agregar(contacto) {
        contacto.id = ++this.ultimoId;
        this.contactos.push(contacto);
        this.ordenar();
    }

    editar(id, datos) {
        let c = this.contactos.find(x => x.id === id);
        if (c) {
            Object.assign(c, datos);
            this.ordenar();
            return true;
        }
        return false;
    }

    borrar(id) {
        let idx = this.contactos.findIndex(x => x.id === id);
        if (idx >= 0) {
            this.contactos.splice(idx, 1);
            return true;
        }
        return false;
    }

    buscar(texto) {
        texto = texto.toLowerCase();
        return this.contactos.filter(c =>
            (c.nombre || "").toLowerCase().includes(texto) ||
            (c.apellido || "").toLowerCase().includes(texto) ||
            (c.email || "").toLowerCase().includes(texto) ||
            (c.telefono || "").toLowerCase().includes(texto)
        );
    }

    listar() {
        return [...this.contactos];
    }

    ordenar() {
        this.contactos.sort((a, b) => {
            if (a.apellido === b.apellido) {
                return a.nombre.localeCompare(b.nombre);
            }
            return a.apellido.localeCompare(b.apellido);
        });
    }

    static async cargar() {
        let agenda = new Agenda();
        try {
            let texto = await read();
            let arr = JSON.parse(texto);
            agenda.contactos = arr.map(obj => new Contacto(obj));// Crear instancias de Contacto1
            agenda.ultimoId = agenda.contactos.reduce((max, c) => Math.max(max, c.id), 0);
            agenda.ordenar();
        } catch {
            // archivo vacío o inexistente agenda vacía
        }
        return agenda;
    }

    async guardar() {
        let arr = this.contactos.map(c => ({ ...c }));
        await write(JSON.stringify(arr, null, 2));
    }
}

async function mostrarMenu() {
    console.log("=== AGENDA DE CONTACTOS ===");
    console.log("1. Listar");
    console.log("2. Agregar");
    console.log("3. Editar");
    console.log("4. Borrar");
    console.log("5. Buscar");
    console.log("0. Finalizar");
    return await prompt("\nIngresar opción :> ");
}

function mostrarContactos(lista) {
    console.log("\nID Nombre Completo       Edad        Teléfono        Email");
    for (let c of lista) {
        console.log(
            String(c.id).padStart(2, '0'),
            c.nombreCompleto.padEnd(20).substring(0, 20),
            String(c.edad).padEnd(10),
            String(c.telefono).padEnd(15),
            c.email
        );
    }
    if (lista.length === 0) console.log("(sin contactos)");
    console.log();
}

async function main() {
    let agenda = await Agenda.cargar();
    let salir = false;
    while (!salir) {
        let opcion = await mostrarMenu();
        switch (opcion) {
            case '1': // Listar
                console.log("\n== Lista de contactos ==");
                mostrarContactos(agenda.listar());
                await prompt("Presione Enter para continuar...");
                break;

            case '2': // Agregar
                console.log("\n== Agregando contacto ==");
                let nombre = await prompt("Nombre      :> ");
                let apellido = await prompt("Apellido    :> ");
                let edad = parseInt(await prompt("Edad        :> "), 10) || 0;
                let telefono = await prompt("Teléfono    :> ");
                let email = await prompt("Email       :> ");
                agenda.agregar(new Contacto({ id: null, nombre, apellido, edad, telefono, email }));
                await agenda.guardar();
                await prompt("Presione Enter para continuar...");
                break;

            case '3': // Editar
                console.log("\n== Editar contacto ==");
                mostrarContactos(agenda.listar());
                let idEdit = parseInt(await prompt("ID contacto :> "), 10);
                if (isNaN(idEdit)) {
                    console.log("ID inválido.");
                    await prompt("Presione Enter para continuar...");
                    break;
                }
                let cEdit = agenda.contactos.find(c => c.id === idEdit);
                if (!cEdit) {
                    console.log("No existe ese contacto.");
                    await prompt("Presione Enter para continuar...");
                    break;
                }
                let nombreE = await prompt(`Nombre (${cEdit.nombre}) :> `) || cEdit.nombre;
                let apellidoE = await prompt(`Apellido (${cEdit.apellido}) :> `) || cEdit.apellido;
                let edadE = parseInt(await prompt(`Edad (${cEdit.edad}) :> `), 10);
                if (isNaN(edadE)) edadE = cEdit.edad;
                let telefonoE = await prompt(`Teléfono (${cEdit.telefono}) :> `) || cEdit.telefono;
                let emailE = await prompt(`Email (${cEdit.email}) :> `) || cEdit.email;
                agenda.editar(idEdit, { nombre: nombreE, apellido: apellidoE, edad: edadE, telefono: telefonoE, email: emailE });
                await agenda.guardar();
                await prompt("Presione Enter para continuar...");
                break;

            case '4': // Borrar
                console.log("\n== Borrar contacto ==");
                mostrarContactos(agenda.listar());
                let idBorrar = parseInt(await prompt("ID contacto :> "), 10);
                if (isNaN(idBorrar)) {
                    console.log("ID inválido.");
                    await prompt("Presione Enter para continuar...");
                    break;
                }
                let cBorrar = agenda.contactos.find(c => c.id === idBorrar);// Buscar contacto con ese id
                if (!cBorrar) {
                    console.log("No existe ese contacto.");
                    await prompt("Presione Enter para continuar...");
                    break;
                }
                mostrarContactos([cBorrar]);
                let conf = await prompt("¿Confirma borrado? :> S/N ");
                if (conf.toUpperCase() === 'S') {
                    agenda.borrar(idBorrar);
                    await agenda.guardar();//await para que espere a que se guarde
                    console.log("Borrado.");
                }
                await prompt("Presione Enter para continuar...");
                break;

            case '5': // Buscar
                console.log("\n== Buscar contacto ==");
                let texto = await prompt("Buscar      :> ");// Buscar en nombre, apellido, email, teléfono
                let encontrados = agenda.buscar(texto);
                mostrarContactos(encontrados);
                await prompt("Presione Enter para continuar...");
                break;

            case '0': // Salir
                salir = true;
                break;

            default:
                console.log("Opción inválida.");
                await prompt("Presione Enter para continuar...");
        }
    }
    console.log("\nFin del programa.");
}

// Ejecutar programa con manejo de errores
main().catch(err => console.error("Error en el programa:", err));
//para evitar errores en la consola
