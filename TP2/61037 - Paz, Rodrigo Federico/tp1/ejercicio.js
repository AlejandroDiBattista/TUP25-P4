import { prompt, read, write } from './io.js';


class Contacto {
    constructor(nombre, apellido, edad, telefono, email, id) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
        this.telefono = telefono;
        this.email = email;
    }

 
    getNombreCompleto() {
        return `${this.apellido}, ${this.nombre}`;
    }
}


class Agenda {
    constructor() {
        this.contactos = [];
        this.nextId = 1; 
    }

    
    agregar(contacto) {
        contacto.id = this.nextId++;
        this.contactos.push(contacto);
    }

    
    editar(id, nuevosDatos) {
        const index = this.contactos.findIndex(c => c.id === id);
        if (index !== -1) {
            this.contactos[index] = { ...this.contactos[index], ...nuevosDatos, id };
            return true;
        }
        return false;
    }

    
    borrar(id) {
        const index = this.contactos.findIndex(c => c.id === id);
        if (index !== -1) {
            const [borrado] = this.contactos.splice(index, 1);
            return borrado;
        }
        return null;
    }

   
    listar() {
        const listaOrdenada = [...this.contactos].sort((a, b) => {
            if (a.apellido > b.apellido) return 1;
            if (a.apellido < b.apellido) return -1;
            if (a.nombre > b.nombre) return 1;
            if (a.nombre < b.nombre) return -1;
            return 0;
        });
        return listaOrdenada;
    }


    buscar(termino) {
        const terminoLower = termino.toLowerCase();
        return this.contactos.filter(contacto =>
            contacto.nombre.toLowerCase().includes(terminoLower) ||
            contacto.apellido.toLowerCase().includes(terminoLower) ||
            contacto.email.toLowerCase().includes(terminoLower)
        );
    }


    async guardar() {
        const data = {
            contactos: this.contactos,
            nextId: this.nextId
        };
        await write(JSON.stringify(data, null, 2));
    }


    static async cargar() {
        const agenda = new Agenda();
        try {
            const data = await read();
            const parsedData = JSON.parse(data);
            if (parsedData.contactos) {

                agenda.contactos = parsedData.contactos.map(c => new Contacto(c.nombre, c.apellido, c.edad, c.telefono, c.email, c.id));
                agenda.nextId = parsedData.nextId;
            }
        } catch (error) {
            console.log("No se encontró el archivo de agenda o está vacío. Creando una nueva.");
        }
        return agenda;
    }
}

let agenda = await Agenda.cargar();

let opcion = -1;
while (opcion !== 0) {
    console.log("\n=== AGENDA DE CONTACTOS ===");
    console.log("1. Listar");
    console.log("2. Agregar");
    console.log("3. Editar");
    console.log("4. Borrar");
    console.log("5. Buscar");
    console.log("0. Finalizar");
    console.log("---------------------------");

    const entrada = await prompt("Ingresar opción :> ");
    opcion = parseInt(entrada, 10);

    console.log("\n");

    switch (opcion) {
        case 1: 
            console.log("== Lista de contactos ==");
            const contactosOrdenados = agenda.listar();
            if (contactosOrdenados.length === 0) {
                console.log("No hay contactos para mostrar.");
            } else {
                console.log("ID Nombre Completo       Edad        Teléfono        Email");
                contactosOrdenados.forEach(c => {
                    console.log(`${String(c.id).padStart(2, '0')} ${c.getNombreCompleto().padEnd(25)} ${String(c.edad).padEnd(10)} ${c.telefono.padEnd(15)} ${c.email}`);
                });
            }
            break;
        case 2: 
            console.log("== Agregando contacto ==");
            const nombre = await prompt("Nombre      :> ");
            const apellido = await prompt("Apellido    :> ");
            const edad = await prompt("Edad        :> ");
            const telefono = await prompt("Teléfono    :> ");
            const email = await prompt("Email       :> ");
            const nuevoContacto = new Contacto(nombre, apellido, edad, telefono, email);
            agenda.agregar(nuevoContacto);
            await agenda.guardar();
            console.log("Contacto agregado exitosamente.");
            break;
        case 3: 
            console.log("== Editar contacto ==");
            const idEditar = parseInt(await prompt("ID del contacto a editar :> "), 10);
            const contactoAEditar = agenda.contactos.find(c => c.id === idEditar);
            if (contactoAEditar) {
                console.log("Ingrese los nuevos datos (deje en blanco para no modificar):");
                const nuevosDatos = {};
                let nuevoNombre = await prompt(`Nombre [${contactoAEditar.nombre}] :> `);
                if (nuevoNombre) nuevosDatos.nombre = nuevoNombre;
                let nuevoApellido = await prompt(`Apellido [${contactoAEditar.apellido}] :> `);
                if (nuevoApellido) nuevosDatos.apellido = nuevoApellido;
                let nuevaEdad = await prompt(`Edad [${contactoAEditar.edad}] :> `);
                if (nuevaEdad) nuevosDatos.edad = nuevaEdad;
                let nuevoTelefono = await prompt(`Teléfono [${contactoAEditar.telefono}] :> `);
                if (nuevoTelefono) nuevosDatos.telefono = nuevoTelefono;
                let nuevoEmail = await prompt(`Email [${contactoAEditar.email}] :> `);
                if (nuevoEmail) nuevosDatos.email = nuevoEmail;

                agenda.editar(idEditar, nuevosDatos);
                await agenda.guardar();
                console.log("Contacto editado exitosamente.");
            } else {
                console.log("Contacto no encontrado.");
            }
            break;
        case 4: 
            console.log("== Borrar contacto ==");
            const idBorrar = parseInt(await prompt("ID del contacto a borrar :> "), 10);
            const contactoABorrar = agenda.contactos.find(c => c.id === idBorrar);
            if (contactoABorrar) {
                console.log("Detalles del contacto a borrar:");
                console.log(`ID: ${contactoABorrar.id}, Nombre: ${contactoABorrar.getNombreCompleto()}`);
                const confirmacion = await prompt("¿Confirma borrado? (S/N) :> ");
                if (confirmacion.toLowerCase() === 's') {
                    agenda.borrar(idBorrar);
                    await agenda.guardar();
                    console.log("Contacto borrado exitosamente.");
                } else {
                    console.log("Borrado cancelado.");
                }
            } else {
                console.log("Contacto no encontrado.");
            }
            break;
        case 5: 
            console.log("== Buscar contacto ==");
            const terminoBusqueda = await prompt("Buscar por nombre, apellido o email :> ");
            const resultados = agenda.buscar(terminoBusqueda);
            if (resultados.length > 0) {
                console.log("\nResultados de la búsqueda:");
                console.log("ID Nombre Completo       Edad        Teléfono        Email");
                resultados.forEach(c => {
                    console.log(`${String(c.id).padStart(2, '0')} ${c.getNombreCompleto().padEnd(25)} ${String(c.edad).padEnd(10)} ${c.telefono.padEnd(15)} ${c.email}`);
                });
            } else {
                console.log("No se encontraron contactos que coincidan con la búsqueda.");
            }
            break;
        case 0:
            console.log("Finalizando la aplicación. ¡Hasta pronto!");
            break;
        default:
            console.log("Opción inválida. Por favor, intente de nuevo.");
    }

    if (opcion !== 0) {
        await prompt("\nPresione Enter para continuar...");
    }
}