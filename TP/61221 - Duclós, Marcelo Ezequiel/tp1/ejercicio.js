import {prompt, read, write} from './io.js';

class Contacto {
    #id
    #nombre
    #apellido
    #edad
    #telefono
    #email

    constructor(nombre = "", apellido = "", edad = 0, telefono = "", email = "", id = null) {
        this.#id = id;
        this.#nombre = nombre;
        this.#apellido = apellido;
        this.#edad = edad;
        this.#telefono = telefono;
        this.#email = email;
    }

    // para leer los datos
    get id() { return this.#id; }
    get nombre() { return this.#nombre; }
    get apellido() { return this.#apellido; }
    get edad() { return this.#edad; }
    get telefono() { return this.#telefono; }
    get email() { return this.#email; }

    get nombreCompleto() {
        return `${this.#apellido}, ${this.#nombre}`;
    }

    // para cambiar los datos
    set id(valor) { this.#id = valor; }
    set nombre(valor) { this.#nombre = valor; }
    set apellido(valor) { this.#apellido = valor; }
    set edad(valor) { this.#edad = valor; }
    set telefono(valor) { this.#telefono = valor; }
    set email(valor) { this.#email = valor; }

    // busca si el texto aparece en algún campo del contacto
    contiene(texto) {
        const busqueda = texto.toLowerCase();
        return this.#nombre.toLowerCase().includes(busqueda) ||
               this.#apellido.toLowerCase().includes(busqueda) ||
               this.#telefono.includes(busqueda) ||
               this.#email.toLowerCase().includes(busqueda);
    }

    // convierte el contacto a formato JSON para guardar
    toJSON() {
        return {
            id: this.#id,
            nombre: this.#nombre,
            apellido: this.#apellido,
            edad: this.#edad,
            telefono: this.#telefono,
            email: this.#email
        };
    }

    // crea un contacto desde los datos del archivo JSON
    static fromJSON(json) {
        return new Contacto(
            json.nombre,
            json.apellido,
            json.edad,
            json.telefono,
            json.email,
            json.id
        );
    }
}

class Agenda {
    #contactos
    #proximoId

    constructor() {
        this.#contactos = [];
        this.#proximoId = 1;
    }

    agregar(contacto) {
        contacto.id = this.#proximoId++;
        this.#contactos.push(contacto);
        this.#ordenar();
        return this;
    }

    editar(id, datosNuevos) {
        const contacto = this.buscarPorId(id);
        if (contacto) {
            if (datosNuevos.nombre !== undefined) contacto.nombre = datosNuevos.nombre;
            if (datosNuevos.apellido !== undefined) contacto.apellido = datosNuevos.apellido;
            if (datosNuevos.edad !== undefined) contacto.edad = datosNuevos.edad;
            if (datosNuevos.telefono !== undefined) contacto.telefono = datosNuevos.telefono;
            if (datosNuevos.email !== undefined) contacto.email = datosNuevos.email;
            this.#ordenar();
            return true;
        }
        return false;
    }

    borrar(id) {
        const indice = this.#contactos.findIndex(c => c.id === id);
        if (indice !== -1) {
            const contactoBorrado = this.#contactos[indice];
            this.#contactos.splice(indice, 1);
            return contactoBorrado;
        }
        return null;
    }

    buscarPorId(id) {
        return this.#contactos.find(c => c.id === id);
    }

    buscar(texto) {
        return this.#contactos.filter(c => c.contiene(texto));
    }

    listar() {
        return [...this.#contactos];
    }

    // ordena por apellido y después por nombre
    #ordenar() {
        this.#contactos.sort((a, b) => {
            const comparacionApellido = a.apellido.localeCompare(b.apellido, 'es', { sensitivity: 'base' });
            if (comparacionApellido !== 0) return comparacionApellido;
            return a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' });
        });
    }

    // busca el ID más alto y pone el siguiente número
    #actualizarProximoId() {
        if (this.#contactos.length > 0) {
            const maxId = Math.max(...this.#contactos.map(c => c.id));
            this.#proximoId = maxId + 1;
        }
    }

    static async cargar() {
        const agenda = new Agenda();
        try {
            const datos = await read();
            const contactosJSON = JSON.parse(datos);
            
            for (const contactoJSON of contactosJSON) {
                const contacto = Contacto.fromJSON(contactoJSON);
                agenda.#contactos.push(contacto);
            }
            
            agenda.#actualizarProximoId();
            agenda.#ordenar();
        } catch (error) {
            console.log("No se pudo cargar la agenda, iniciando con agenda vacía.");
        }
        return agenda;
    }

    async guardar() {
        const datos = JSON.stringify(this.#contactos, null, 2);
        await write(datos);
    }
}

// muestra el menú principal
async function mostrarMenu() {
    console.clear();
    console.log("=== AGENDA DE CONTACTOS ===");
    console.log("1. Listar");
    console.log("2. Agregar");
    console.log("3. Editar");
    console.log("4. Borrar");
    console.log("5. Buscar");
    console.log("0. Finalizar");
    console.log();
    return await prompt("Ingresar opción :> ");
}

// muestra los contactos en formato tabla
function mostrarContactos(contactos) {
    if (contactos.length === 0) {
        console.log("No hay contactos para mostrar.");
        return;
    }

    console.log("ID Nombre Completo       Edad        Teléfono        Email");
    console.log("-- -------------------- ----------- --------------- --------------------");
    
    for (const contacto of contactos) {
        const id = contacto.id.toString().padStart(2, '0');
        const nombre = contacto.nombreCompleto.padEnd(20);
        const edad = contacto.edad.toString().padEnd(11);
        const telefono = contacto.telefono.padEnd(15);
        const email = contacto.email;
        
        console.log(`${id} ${nombre} ${edad} ${telefono} ${email}`);
    }
}

// pausa hasta que el usuario presione Enter
async function esperarEnter() {
    await prompt("\nPresione Enter para continuar...");
}

// muestra todos los contactos
async function listarContactos(agenda) {
    console.log("\n== Lista de contactos ==");
    const contactos = agenda.listar();
    mostrarContactos(contactos);
    await esperarEnter();
}

// pide los datos y crea un contacto nuevo
async function agregarContacto(agenda) {
    console.log("\n== Agregando contacto ==");
    
    const nombre = await prompt("Nombre      :> ");
    const apellido = await prompt("Apellido    :> ");
    const edad = parseInt(await prompt("Edad        :> "));
    const telefono = await prompt("Teléfono    :> ");
    const email = await prompt("Email       :> ");
    
    const contacto = new Contacto(nombre, apellido, edad, telefono, email);
    agenda.agregar(contacto);
    
    console.log("\nContacto agregado exitosamente.");
    await esperarEnter();
}

// permite cambiar los datos de un contacto existente
async function editarContacto(agenda) {
    console.log("\n== Editar contacto ==");
    
    const contactos = agenda.listar();
    if (contactos.length === 0) {
        console.log("No hay contactos para editar.");
        await esperarEnter();
        return;
    }
    
    mostrarContactos(contactos);
    console.log();
    
    const idStr = await prompt("ID contacto :> ");
    const id = parseInt(idStr);
    
    const contacto = agenda.buscarPorId(id);
    if (!contacto) {
        console.log("Contacto no encontrado.");
        await esperarEnter();
        return;
    }
    
    console.log(`\nEditando: ${contacto.nombreCompleto}`);
    console.log("(Presione Enter para mantener el valor actual)");
    
    const nombre = await prompt(`Nombre      [${contacto.nombre}] :> `);
    const apellido = await prompt(`Apellido    [${contacto.apellido}] :> `);
    const edadStr = await prompt(`Edad        [${contacto.edad}] :> `);
    const telefono = await prompt(`Teléfono    [${contacto.telefono}] :> `);
    const email = await prompt(`Email       [${contacto.email}] :> `);
    
    const datosNuevos = {};
    if (nombre) datosNuevos.nombre = nombre;
    if (apellido) datosNuevos.apellido = apellido;
    if (edadStr) datosNuevos.edad = parseInt(edadStr);
    if (telefono) datosNuevos.telefono = telefono;
    if (email) datosNuevos.email = email;
    
    agenda.editar(id, datosNuevos);
    console.log("\nContacto editado exitosamente.");
    await esperarEnter();
}

// elimina un contacto después de confirmar
async function borrarContacto(agenda) {
    console.log("\n== Borrar contacto ==");
    
    const contactos = agenda.listar();
    if (contactos.length === 0) {
        console.log("No hay contactos para borrar.");
        await esperarEnter();
        return;
    }
    
    mostrarContactos(contactos);
    console.log();
    
    const idStr = await prompt("ID contacto :> ");
    const id = parseInt(idStr);
    
    const contacto = agenda.buscarPorId(id);
    if (!contacto) {
        console.log("Contacto no encontrado.");
        await esperarEnter();
        return;
    }
    
    console.log("\nBorrando...");
    mostrarContactos([contacto]);
    
    const confirmacion = await prompt("\n¿Confirma borrado? S/N :> ");
    
    if (confirmacion.toLowerCase() === 's' || confirmacion.toLowerCase() === 'si') {
        agenda.borrar(id);
        console.log("Contacto borrado exitosamente.");
    } else {
        console.log("Operación cancelada.");
    }
    
    await esperarEnter();
}

// busca contactos que contengan el texto ingresado
async function buscarContactos(agenda) {
    console.log("\n== Buscar contacto ==");
    console.log();
    
    const textoBusqueda = await prompt("Buscar      :> ");
    
    if (!textoBusqueda) {
        console.log("Debe ingresar un texto para buscar.");
        await esperarEnter();
        return;
    }
    
    const resultados = agenda.buscar(textoBusqueda);
    
    console.log();
    if (resultados.length === 0) {
        console.log("No se encontraron contactos.");
    } else {
        mostrarContactos(resultados);
    }
    
    await esperarEnter();
}

// función principal que ejecuta todo el programa
async function main() {
    const agenda = await Agenda.cargar();
    
    let continuar = true;
    
    while (continuar) {
        const opcion = await mostrarMenu();
        
        switch (opcion) {
            case '1':
                await listarContactos(agenda);
                break;
            case '2':
                await agregarContacto(agenda);
                await agenda.guardar();
                break;
            case '3':
                await editarContacto(agenda);
                await agenda.guardar();
                break;
            case '4':
                await borrarContacto(agenda);
                await agenda.guardar();
                break;
            case '5':
                await buscarContactos(agenda);
                break;
            case '0':
                console.log("\n¡Hasta luego!");
                continuar = false;
                break;
            default:
                console.log("\nOpción no válida. Presione Enter para continuar...");
                await esperarEnter();
        }
    }
}

// arranca la aplicación
main().catch(console.error); 