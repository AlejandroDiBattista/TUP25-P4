const fs = require('fs');
const readline = require('readline');

//CLASE CONTACTO
class Contacto {
	constructor(id, nombre, apellido, edad, telefono, email) {
		this.id = id;
		this.nombre = nombre;
		this.apellido = apellido;
		this.edad = edad;
		this.telefono = telefono;
		this.email = email;
	}
}

//  CLASE AGENDA
class Agenda {
	constructor(archivo = 'agenda.json') {
		this.archivo = archivo;
		this.contactos = [];
		this.nextId = 1;
		this.cargar();
	}

	// Cargar desde archivo
	cargar() {
		if (fs.existsSync(this.archivo)) {
			const data = JSON.parse(fs.readFileSync(this.archivo, 'utf8'));
			this.contactos = data.contactos || [];
			this.nextId = data.nextId || 1;
		}
	}

	// Guardar en archivo
	guardar() {
		fs.writeFileSync(
			this.archivo,
			JSON.stringify({ contactos: this.contactos, nextId: this.nextId }, null, 2),
			'utf8'
		);
	}

	// Agregar contacto
	agregar(nombre, apellido, edad, telefono, email) {
		const contacto = new Contacto(
			this.nextId++,
			nombre,
			apellido,
			edad,
			telefono,
			email
		);
		this.contactos.push(contacto);
		this.guardar();
		console.log('Contacto agregado con éxito');
	}

	// Editar contacto
	editar(id, nuevosDatos) {
		const contacto = this.contactos.find((c) => c.id === id);
		if (!contacto) {
			console.log('Contacto no encontrado.');
			return;
		}
		Object.assign(contacto, nuevosDatos);
		this.guardar();
		console.log('Contacto editado correctamente');
	}

	// Borrar contacto
	borrar(id) {
		const index = this.contactos.findIndex((c) => c.id === id);
		if (index === -1) {
			console.log('Contacto no encontrado.');
			return;
		}
		this.contactos.splice(index, 1);
		this.guardar();
		console.log('Contacto eliminado');
	}

	// Listar ordenados por apellido y nombre
	listar() {
		if (this.contactos.length === 0) {
			console.log('Agenda vacía.');
			return;
		}
		console.log('\nLista de contactos:');
		this.contactos
			.sort((a, b) => (a.apellido + a.nombre).localeCompare(b.apellido + b.nombre))
			.forEach((c) =>
				console.log(
					`[${c.id}] ${c.apellido}, ${c.nombre} | Edad: ${c.edad} | Tel: ${c.telefono} | Email: ${c.email}`
				)
			);
	}

	// Buscar por contenido
	buscar(texto) {
		const resultados = this.contactos.filter(
			(c) =>
				c.nombre.toLowerCase().includes(texto.toLowerCase()) ||
				c.apellido.toLowerCase().includes(texto.toLowerCase()) ||
				c.telefono.includes(texto) ||
				c.email.toLowerCase().includes(texto.toLowerCase())
		);
		if (resultados.length === 0) {
			console.log('No se encontraron coincidencias.');
		} else {
			console.log('\nResultados de búsqueda:');
			resultados.forEach((c) =>
				console.log(
					`[${c.id}] ${c.apellido}, ${c.nombre} | Edad: ${c.edad} | Tel: ${c.telefono} | Email: ${c.email}`
				)
			);
		}
	}
}

// MENÚ EN CONSOLA
const agenda = new Agenda();
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

function mostrarMenu() {
	console.log(`
==============================
    AGENDA DE CONTACTOS
==============================
1) Agregar contacto
2) Editar contacto
3) Borrar contacto
4) Listar contactos
5) Buscar contacto
0) Salir
`);
	rl.question('Elige una opción: ', (opcion) => {
		switch (opcion) {
			case '1':
				rl.question('Nombre: ', (nombre) => {
					rl.question('Apellido: ', (apellido) => {
						rl.question('Edad: ', (edad) => {
							rl.question('Teléfono: ', (telefono) => {
								rl.question('Email: ', (email) => {
									agenda.agregar(nombre, apellido, edad, telefono, email);
									mostrarMenu();
								});
							});
						});
					});
				});
				break;
			case '2':
				rl.question('ID del contacto a editar: ', (id) => {
					const contactoId = parseInt(id);
					rl.question('Nuevo Nombre: ', (nombre) => {
						rl.question('Nuevo Apellido: ', (apellido) => {
							rl.question('Nueva Edad: ', (edad) => {
								rl.question('Nuevo Teléfono: ', (telefono) => {
									rl.question('Nuevo Email: ', (email) => {
										agenda.editar(contactoId, {
											nombre,
											apellido,
											edad,
											telefono,
											email,
										});
										mostrarMenu();
									});
								});
							});
						});
					});
				});
				break;
			case '3':
				rl.question('ID del contacto a borrar: ', (id) => {
					agenda.borrar(parseInt(id));
					mostrarMenu();
				});
				break;
			case '4':
				agenda.listar();
				mostrarMenu();
				break;
			case '5':
				rl.question('Texto a buscar: ', (texto) => {
					agenda.buscar(texto);
					mostrarMenu();
				});
				break;
			case '0':
				console.log('Saliendo de la agenda...');
				rl.close();
				break;
			default:
				console.log('Opción no válida.');
				mostrarMenu();
		}
	});
}

mostrarMenu();
