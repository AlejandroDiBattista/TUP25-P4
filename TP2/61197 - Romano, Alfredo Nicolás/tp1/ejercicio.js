import {prompt, read, write} from './io.js';

class Contacto {
    constructor({id, nombre, apellido, edad, telefono, email}) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
        this.telefono = telefono;
        this.email = email;
    }
    nombreCompleto() {
        return `${this.apellido}, ${this.nombre}`;
    }
}

class Agenda {
    constructor(contactos = [], ultimoId = 0) {
        this.contactos = contactos;
        this.ultimoId = ultimoId;
    }
    agregar(contacto){
        contacto.id = ++this.ultimoId;
        this.contactos.push(contacto);
        this.ordenar();
    }

    editar(id, datos) {
        let c = this.contactos.find(c => c.id === id);
        if (c) {
            Object.assign(c, datos);
            this.ordenar();
            return true;
        }
        return false;
    }

    borrar(id) {
        const index = this.contactos.findIndex(c => c.id === id);
        if (index >= 0) {
            const [borrado] = this.contactos.splice(index, 1);
            return borrado;
        }
        return null;
    }

    buscar(texto) {
        texto = texto.toLowerCase();
        return this.contactos.filter(c =>
            c.nombre.toLowerCase().includes(texto) ||
            c.apellido.toLowerCase().includes(texto) ||
            c.email.toLowerCase().includes(texto) ||
            c.telefono.toLowerCase().includes(texto)
        );
    }

    ordenar() {
        this.contactos.sort((a, b) => {
            if (a.apellido === b.apellido) {
                return a.nombre.localeCompare(b.nombre);
            }
            return a.apellido.localeCompare(b.apellido);
        });
    }

    listar() {
        return [...this.contactos];
    }

    static async cargar(){ 
        let array;
        try {
            array = JSON.parse(await read());
        } catch {
            array = [];
        }
        if (!Array.isArray(array)) array = [];
        let contactos = array.map(obj => new Contacto(obj));
        let ultimoId = contactos.reduce((max, c) => c.id > max ? c.id : max, 0);
        return new Agenda(contactos, ultimoId);
    }

    async guardar(){
        await write(JSON.stringify(this.contactos, null, 2));
    }

}

async function pausa() {
    await prompt("Presione Enter para continuar...");
}

function mostrarContactos(contactos) {
    console.log("ID\t\tNombre Completo\t\tEdad\t\tTeléfono\t\tEmail");
    let ordenados = [...contactos].sort((a, b) => a.id - b.id);
    for (let c of ordenados) {
        console.log(
            String(c.id).padStart(2, '0') + "\t\t" +
            c.nombreCompleto() + "\t\t" +
            String(c.edad) + "\t\t" +
            String(c.telefono) + "\t\t" +
            c.email
        );
    }
}

async function main() {
    let agenda = await Agenda.cargar();
    let salir = false;
    while (!salir) {
        console.clear();
        console.log("=== AGENDA DE CONTACTOS ===\n1. Listar\n2. Agregar\n3. Editar\n4. Borrar\n5. Buscar\n0. Finalizar\n");
        let opcion = await prompt("Ingresar opción: ");
        switch (opcion) {
            case '1':
                console.clear();
                console.log("\n== Lista de contactos ==");
                mostrarContactos(agenda.listar());
                await pausa();
                break;

            case '2':
                console.clear();
                console.log("\n== Agregando contacto ==");
                let nuevo = new Contacto({
                    nombre: await prompt("Nombre: "),
                    apellido: await prompt("Apellido: "),
                    edad: await prompt("Edad: "),
                    telefono: await prompt("Teléfono: "),
                    email: await prompt("Email: ")
                });
                agenda.agregar(nuevo);
                await agenda.guardar();
                await pausa();
                break;

            case '3':
                console.clear();
                console.log("\n== Editar contacto ==");
                let idEdit = parseInt(await prompt("ID contacto: "));
                let cEdit = agenda.contactos.find(c => c.id === idEdit);
                if (!cEdit) {
                    console.log("No existe ese contacto.");
                    await pausa();
                    break;
                }
                let datosEdit = {
                    nombre: await prompt(`Nombre (${cEdit.nombre}): `) || cEdit.nombre,
                    apellido: await prompt(`Apellido (${cEdit.apellido}): `) || cEdit.apellido,
                    edad: await prompt(`Edad (${cEdit.edad}): `) || cEdit.edad,
                    telefono: await prompt(`Teléfono (${cEdit.telefono}): `) || cEdit.telefono,
                    email: await prompt(`Email (${cEdit.email}): `) || cEdit.email
                };
                agenda.editar(idEdit, datosEdit);
                await agenda.guardar();
                await pausa();
                break;

            case '4':
                console.clear();
                console.log("\n== Borrar contacto ==");
                let idBorrar = parseInt(await prompt("ID contacto: "));
                let cBorrar = agenda.contactos.find(c => c.id === idBorrar);
                if (!cBorrar) {
                    console.log("No existe ese contacto.");
                    await pausa();
                    break;
                }
                console.log("Borrando...");
                mostrarContactos([cBorrar]);
                let conf = await prompt("¿Confirma borrado? (S/N): ");
                if (conf.toLowerCase() === 's') {
                    agenda.borrar(idBorrar);
                    await agenda.guardar();
                    console.log("Contacto borrado.");
                } else {
                    console.log("Cancelado.");
                }
                await pausa();
                break;

            case '5':
                console.clear();
                console.log("\n== Buscar contacto ==");
                let texto = await prompt("Buscar: ");
                let encontrados = agenda.buscar(texto);
                mostrarContactos(encontrados);
                await pausa();
                break;
            case '0':
                salir = true;
                break;
            default:
                console.log("Opción inválida.");
                await pausa();
        }
    }
}

main();