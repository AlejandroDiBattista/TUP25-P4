import {prompt, read, write} from './io.js';

class Contacto {
    constructor(id, nombre, apellido, edad, telefono, email){
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
        this.telefono = telefono;
        this.email = email;
    }
}

class Agenda {

    constructor(){
        this.contactos = [];
        this.ultimoId = 0;
    }

    agregar(contacto){
        //aumento ultimo id
        let nuevoId = this.ultimoId + 1;
        contacto.id = nuevoId;

        //agrego contacto al array
        this.contactos.push(contacto);
        console.log("\n>>>>>>>>>> Contacto agregado con ID: " + contacto.id);
        this.ultimoId = nuevoId;

    }

    listarContactos(){
        console.log("\n<<<<<<<<< LISTA DE CONTACTOS >>>>>>>>>\n");
        if(this.contactos.length === 0){
            console.log("No hay contactos en la agenda.");
            return;
        }

        //ordeno arrar por apellido y nombre
        this.contactos.sort((a, b) => {
            if(a.apellido.toLowerCase() < b.apellido.toLowerCase()) return -1;
            if(a.apellido.toLowerCase() > b.apellido.toLowerCase()) return 1;
            if(a.nombre.toLowerCase() < b.nombre.toLowerCase()) return -1;
            if(a.nombre.toLowerCase() > b.nombre.toLowerCase()) return 1;
            return 0;
        });

    console.log(
        "ID".padEnd(4) +
        "Nombre Completo".padEnd(25) +
        "Edad".padEnd(8) +
        "Teléfono".padEnd(15) +
        "Email"
    );

    this.contactos.forEach(c => {
        const id = String(c.id).padEnd(4);
        const nombreCompleto = `${c.apellido}, ${c.nombre}`.padEnd(25);
        const edad = String(c.edad).padEnd(8);
        const telefono = String(c.telefono).padEnd(15);
        const email = c.email;

        console.log(id + nombreCompleto + edad + telefono + email);
    });

    }

    buscar(texto){
        //filtro contactos que contengan el texto en nombre, apellido, telefono o email
        let resultados = this.contactos.filter(c =>
            String(c.nombre).toLowerCase().includes(texto.toLowerCase()) ||
            String(c.apellido).toLowerCase().includes(texto.toLowerCase()) ||
            String(c.telefono).toLowerCase().includes(texto.toLowerCase()) ||
            String(c.email).toLowerCase().includes(texto.toLowerCase())
        );

        //muestro los que coinciden y si no, un mensaje
        if(resultados.length === 0){
            console.log("\n No se encontraron contactos que coincidan con la búsqueda.");
            return;
        }
        console.log("\n <<<<<<<<< RESULTADOS DE LA BÚSQUEDA >>>>>>>>>\n");
        for(let c of resultados){
            console.log(`ID: ${c.id} | Nombre: ${c.nombre} ${c.apellido} | Edad: ${c.edad} | Teléfono: ${c.telefono} | Email: ${c.email}`);
        }

    }

    async editar(id){
        let contacto = this.contactos.find(c => c.id === id);
        if(!contacto){
            console.log("\n >>>>>>>>  No se encontró un contacto con ese ID.");
            return;
        }
        let nuevoNombre = await prompt(`Nombre (${contacto.nombre}): `);
        let nuevoApellido = await prompt(`Apellido (${contacto.apellido}): `);
        let nuevaEdad = await prompt(`Edad (${contacto.edad}): `);
        let nuevoTelefono = await prompt(`Teléfono (${contacto.telefono}): `);
        let nuevoEmail = await prompt(`Email (${contacto.email}): `);
        if(nuevoNombre) contacto.nombre = nuevoNombre;
        if(nuevoApellido) contacto.apellido = nuevoApellido;
        if(nuevaEdad) contacto.edad = nuevaEdad;
        if(nuevoTelefono) contacto.telefono = nuevoTelefono;
        if(nuevoEmail) contacto.email = nuevoEmail;
        console.log("\n>>>>>>>>>>Contacto actualizado.");
        return;
    }

    async borrar(id){

        let index = this.contactos.findIndex(c => c.id === id);
        if(index === -1){
            console.log("\n ❌ No se encontró un contacto con ese ID.");
            return;
        }


        let contacto = this.contactos[index];
        console.log(`ID: ${contacto.id} | Nombre: ${contacto.nombre} ${contacto.apellido} | Edad: ${contacto.edad} | Teléfono: ${contacto.telefono} | Email: ${contacto.email}`);

        let confirmacion = await prompt("\n ¿Está seguro que desea eliminar este contacto? (s/n): ");

        if(confirmacion.toLowerCase() === 's'){
            this.contactos.splice(index, 1);
            console.log("\n✅ Contacto eliminado.");
            return;
        }else{
            console.log("\n❌ Operación cancelada, el contacto no fue eliminado.");
            return;
        }
    }

    static async cargar(){


        let data;
        try {
            data = await read('agenda.json');
        } catch (error) {
            console.log("\n No se pudo leer el archivo agenda.json, se creará uno nuevo al guardar.");
            return new Agenda();
        }
        if (!data || data.trim() === "") {
        console.log("\n El archivo agenda.json está vacío, se creará uno nuevo al guardar.");
        return new Agenda();
    }

    let obj;
    try {
        obj = JSON.parse(data);
    } catch (error) {
        console.log("\n El archivo agenda.json no contiene un JSON válido, se creará uno nuevo al guardar.");
        return new Agenda();
    }

    if (!obj.contactos || !Array.isArray(obj.contactos)) {
        console.log("\n El archivo agenda.json no contiene una lista de contactos válida, se creará uno nuevo al guardar.");
        return new Agenda();
    }


    let agenda = new Agenda();
    agenda.contactos = obj.contactos.map(c =>
        new Contacto(c.id, c.nombre, c.apellido, c.edad, c.telefono, c.email)
    );

    agenda.ultimoId =
        agenda.contactos.length > 0
            ? Math.max(...agenda.contactos.map(c => c.id ?? 0))
            : 0;

        return agenda;
    }

    async guardar(){
        let obj = {
            contactos: this.contactos
        };
        let data = JSON.stringify(obj, null, 2);

        try {
            await write(data, 'agenda.json');
            console.log("\nAgenda guardada en agenda.json");
        } catch (error) {
            console.log("\nNo se pudo guardar la agenda en agenda.json");
        }
    }
}


// EJEMPLO DE USO... borrar...
/*let agenda = await Agenda.cargar();

console.log("=== Ingresar nuevo contacto ===");

let c = new Contacto();
c.nombre = await prompt("Nombre :>");
c.edad   = await prompt("Edad   :>");
agenda.agregar(c);

await agenda.guardar(); */

async function main(){
    let agenda = await Agenda.cargar();

    while(true){
        console.log("\n\n<<<<<<<<<< AGENDA >>>>>>>>>>\n");
        console.log("1. Listar contactos");
        console.log("2. Agregar contacto");
        console.log("3. Editar contacto");
        console.log("4. Borrar contacto");
        console.log("5. Buscar contacto");
        console.log("0. Salir");

        let opcion = await prompt("Opción: ");

        switch(opcion){
            case "1":
                console.clear();
                agenda.listarContactos();
                break;
            case "2":
                console.clear();
                console.log("\n<<<<<<<<<< Agregar contacto >>>>>>>>>>\n");
                let nombre = await prompt("Nombre: ");
                let apellido = await prompt("Apellido: ");
                let edad = await prompt("Edad: ");
                let telefono = await prompt("Teléfono: ");
                let email = await prompt("Email: ");
                let c = new Contacto(null, nombre, apellido, edad, telefono, email);
                agenda.agregar(c);
                await agenda.guardar();
                break;
            case "3":
                console.clear();
                console.log("\n<<<<<<<<<< Editar contacto >>>>>>>>>>\n");
                let id = await prompt("ID de contacto: ");
                await agenda.editar(Number(id));
                await agenda.guardar();
                break;
            case "4":
                console.clear();
                console.log("\n<<<<<<<<<< Borrar contacto >>>>>>>>>>\n");
                let idBorrar = await prompt("ID de contacto: ");
                await agenda.borrar(Number(idBorrar));
                await agenda.guardar();
                break;
            case "5":
                console.clear();
                console.log("\n<<<<<<<<<< Buscar contacto >>>>>>>>>>\n");
                let tBuscar = await prompt("Buscar contacto: ");
                agenda.buscar(tBuscar);
                break;
            case "0":
                console.log("\n >>>> Saliendo...");
                return;
            default:
                console.log("\n ❌ <<Opción inválida>>>");
        }
    }
}

main();