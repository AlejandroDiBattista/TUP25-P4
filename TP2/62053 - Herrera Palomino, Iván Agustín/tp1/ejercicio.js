const fs = require("fs");
const readline = require("readline");

// Clase Contacto
class Contacto {
    constructor(id, nombre, apellido, edad, telefono, email) {
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

// Clase Agenda
class Agenda {
    constructor(archivo = "agenda.json") {
        this.archivo = archivo;
        this.contactos = [];
        this.proximoId = 1;
        this.cargar();
    }

    agregar(nombre, apellido, edad, telefono, email) {
        const contacto = new Contacto(this.proximoId, nombre, apellido, edad, telefono, email);
        this.contactos.push(contacto);
        this.proximoId++;
        this.guardar();
    }

    editar(id, nombre, apellido, edad, telefono, email) {
        const contacto = this.buscarPorId(id);
        if (contacto) {
            if (nombre) contacto.nombre = nombre;
            if (apellido) contacto.apellido = apellido;
            if (edad) contacto.edad = edad;
            if (telefono) contacto.telefono = telefono;
            if (email) contacto.email = email;
            this.guardar();
            return true;
        }
        return false;
    }

    borrar(id) {
        const index = this.contactos.findIndex(c => c.id === id);
        if (index !== -1) {
            const eliminado = this.contactos.splice(index, 1)[0];
            this.guardar();
            return eliminado;
        }
        return null;
    }

    listar() {
        return [...this.contactos].sort((a, b) => {
            if (a.apellido.toLowerCase() === b.apellido.toLowerCase()) {
                return a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase());
            }
            return a.apellido.toLowerCase().localeCompare(b.apellido.toLowerCase());
        });
    }

    buscar(termino) {
        termino = termino.toLowerCase();
        return this.contactos.filter(c =>
            c.nombre.toLowerCase().includes(termino) ||
            c.apellido.toLowerCase().includes(termino) ||
            c.email.toLowerCase().includes(termino) ||
            c.telefono.includes(termino)
        );
    }

    buscarPorId(id) {
        return this.contactos.find(c => c.id === id);
    }

    guardar() {
        fs.writeFileSync(this.archivo, JSON.stringify(this.contactos, null, 4), "utf-8");
    }

    cargar() {
        if (fs.existsSync(this.archivo)) {
            const datos = JSON.parse(fs.readFileSync(this.archivo, "utf-8"));
            this.contactos = datos.map(d => new Contacto(d.id, d.nombre, d.apellido, d.edad, d.telefono, d.email));
            if (this.contactos.length > 0) {
                this.proximoId = Math.max(...this.contactos.map(c => c.id)) + 1;
            }
        }
    }
}

// Funciones auxiliares
function mostrarContactos(contactos) {
    console.log("ID Nombre Completo        Edad  Teléfono      Email");
    contactos.forEach(c => {
        console.log(`${String(c.id).padStart(2, "0")} ${c.nombreCompleto().padEnd(20)} ${c.edad.toString().padEnd(5)} ${c.telefono.padEnd(12)} ${c.email}`);
    });
}

// Entrada de datos con readline
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function preguntar(texto) {
    return new Promise(resolve => rl.question(texto, resp => resolve(resp)));
}

// Programa principal
async function main() {
    const agenda = new Agenda();

    while (true) {
        console.log("\n=== AGENDA DE CONTACTOS ===");
        console.log("1. Listar");
        console.log("2. Agregar");
        console.log("3. Editar");
        console.log("4. Borrar");
        console.log("5. Buscar");
        console.log("0. Finalizar");

        const opcion = await preguntar("\nIngresar opción :> ");

        if (opcion === "1") {
            console.log("\n== Lista de contactos ==");
            mostrarContactos(agenda.listar());
            await preguntar("\nPresione Enter para continuar...");

        } else if (opcion === "2") {
            console.log("\n== Agregando contacto ==");
            const nombre = await preguntar("Nombre      :> ");
            const apellido = await preguntar("Apellido    :> ");
            const edad = await preguntar("Edad        :> ");
            const telefono = await preguntar("Teléfono    :> ");
            const email = await preguntar("Email       :> ");
            agenda.agregar(nombre, apellido, edad, telefono, email);
            console.log("\nContacto agregado.");
            await preguntar("\nPresione Enter para continuar...");

        } else if (opcion === "3") {
            console.log("\n== Editar contacto ==");
            const id = parseInt(await preguntar("ID contacto :> "));
            const contacto = agenda.buscarPorId(id);
            if (contacto) {
                console.log(`\nEditando: ${contacto.nombreCompleto()}`);
                const nombre = await preguntar(`Nombre (${contacto.nombre}) :> `) || contacto.nombre;
                const apellido = await preguntar(`Apellido (${contacto.apellido}) :> `) || contacto.apellido;
                const edad = await preguntar(`Edad (${contacto.edad}) :> `) || contacto.edad;
                const telefono = await preguntar(`Teléfono (${contacto.telefono}) :> `) || contacto.telefono;
                const email = await preguntar(`Email (${contacto.email}) :> `) || contacto.email;
                agenda.editar(id, nombre, apellido, edad, telefono, email);
                console.log("\nContacto editado.");
            } else {
                console.log("No existe ese ID.");
            }
            await preguntar("\nPresione Enter para continuar...");

        } else if (opcion === "4") {
            console.log("\n== Borrar contacto ==");
            const id = parseInt(await preguntar("ID contacto :> "));
            const contacto = agenda.buscarPorId(id);
            if (contacto) {
                mostrarContactos([contacto]);
                const confirma = (await preguntar("\n¿Confirma borrado? (S/N) :> ")).toLowerCase();
                if (confirma === "s") {
                    agenda.borrar(id);
                    console.log("\nContacto borrado.");
                }
            } else {
                console.log("No existe ese ID.");
            }
            await preguntar("\nPresione Enter para continuar...");

        } else if (opcion === "5") {
            console.log("\n== Buscar contacto ==");
            const termino = await preguntar("Buscar      :> ");
            const resultados = agenda.buscar(termino);
            mostrarContactos(resultados);
            await preguntar("\nPresione Enter para continuar...");

        } else if (opcion === "0") {
            console.log("Finalizando...");
            rl.close();
            break;

        } else {
            console.log("Opción inválida. Intente de nuevo.");
        }
    }
}

main();