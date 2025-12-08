'use strict';
// Funciones generales

// Clase Contacto
class Contacto {
    constructor(id, nombre, apellido, telefono, email) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.telefono = telefono;
        this.email = email;
    }
}

// Clase Agenda
class Agenda {
    constructor() {
        this.contactos = [];
        this.ultimoId = 0;
    }

    agregarContacto(nombre, apellido, telefono, email) {
        const nuevoContacto = new Contacto(
            ++this.ultimoId,
            nombre,
            apellido,
            telefono,
            email
        );
        this.contactos.push(nuevoContacto);
        return nuevoContacto;
    }

    actualizarContacto(id, datosActualizados) {
        const contacto = this.contactos.find(c => c.id === id);
        if (contacto) {
            contacto.nombre = datosActualizados.nombre;
            contacto.apellido = datosActualizados.apellido;
            contacto.telefono = datosActualizados.telefono;
            contacto.email = datosActualizados.email;
            return true;
        }
        return false;
    }

    borrarContacto(id) {
        const indice = this.contactos.findIndex(c => c.id === id);
        if (indice !== -1) {
            this.contactos.splice(indice, 1);
            return true;
        }
        return false;
    }

    obtenerContactos() {
        //COPIA ORDENADA
        return [...this.contactos].sort((a, b) => {
            const apA = a.apellido.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            const apB = b.apellido.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            if (apA === apB) {
                const nomA = a.nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
                const nomB = b.nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
                return nomA.localeCompare(nomB);
            }
            return apA.localeCompare(apB);
        });
    }

    filtrarContactos(texto) {
        const normalizar = str => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const filtro = normalizar(texto);
        return this.obtenerContactos().filter(c =>
            normalizar(c.nombre).includes(filtro) ||
            normalizar(c.apellido).includes(filtro) ||
            normalizar(c.telefono).includes(filtro)
        );
    }
}

// Instancia global de la agenda
const agenda = new Agenda();

// Contactos de ejemplo
const contactosEjemplo = [
    ["Juan", "Pérez", "111111111", "juan.perez@mail.com"],
    ["Ana", "García", "222222222", "ana.garcia@mail.com"],
    ["Luis", "Martínez", "333333333", "luis.martinez@mail.com"],
    ["María", "López", "444444444", "maria.lopez@mail.com"],
    ["Pedro", "Sánchez", "555555555", "pedro.sanchez@mail.com"],
    ["Lucía", "Torres", "666666666", "lucia.torres@mail.com"],
    ["Carlos", "Ramírez", "777777777", "carlos.ramirez@mail.com"],
    ["Sofía", "Flores", "888888888", "sofia.flores@mail.com"],
    ["Miguel", "Gómez", "999999999", "miguel.gomez@mail.com"],
    ["Valentina", "Díaz", "101010101", "valentina.diaz@mail.com"]
];

contactosEjemplo.forEach(([nombre, apellido, telefono, email]) => {
    agenda.agregarContacto(nombre, apellido, telefono, email);
});

// EXCEPCIONES Y BOTONES
function renderizarContactos(lista) {
    const contenedor = document.getElementById('contactos-lista');
    contenedor.innerHTML = '';

    if (lista.length === 0) {
        contenedor.innerHTML = '<p>No hay contactos para mostrar.</p>';
        return;
    }

    lista.forEach(contacto => {
        const card = document.createElement('article');
        card.className = 'contacto-card';

        card.innerHTML = `
            <header>
                <strong>${contacto.nombre} ${contacto.apellido}</strong>
            </header>
            <p>📞 ${contacto.telefono}</p>
            <p>✉️ ${contacto.email}</p>
            <footer>
                <button class="editar-btn" data-id="${contacto.id}" title="Editar">Edición</button>
                <button class="borrar-btn" data-id="${contacto.id}" title="Borrar">Eliminar</button>
            </footer>
        `;
        contenedor.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderizarContactos(agenda.obtenerContactos());
});

// --- Lógica del buscador ---
document.getElementById('buscador').addEventListener('input', (e) => {
    const texto = e.target.value;
    const resultados = texto.trim()
        ? agenda.filtrarContactos(texto)
        : agenda.obtenerContactos();
    renderizarContactos(resultados);
});

// --- Lógica del botón "Agregar" ---
const dialogo = document.getElementById('contacto-dialogo');
const form = document.getElementById('contacto-form');
const dialogoTitulo = document.getElementById('dialogo-titulo');
const contactoIdInput = document.getElementById('contacto-id');

document.getElementById('agregar-btn').addEventListener('click', () => {
    dialogoTitulo.textContent = 'Nuevo Contacto';
    form.reset();
    contactoIdInput.value = '';
    dialogo.showModal();
});

// --- Lógica del botón "Cancelar" del diálogo ---
document.getElementById('cancelar-btn').addEventListener('click', (e) => {
    e.preventDefault();
    dialogo.close();
});

// --- Guardar contacto (alta o edición) ---
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = contactoIdInput.value ? parseInt(contactoIdInput.value) : null;
    const nombre = document.getElementById('contacto-nombre').value.trim();
    const apellido = document.getElementById('contacto-apellido').value.trim();
    const telefono = document.getElementById('contacto-telefono').value.trim();
    const email = document.getElementById('contacto-email').value.trim();

    if (!nombre || !apellido || !telefono || !email) return;

    if (id) {
        // Edición
        agenda.actualizarContacto(id, { nombre, apellido, telefono, email });
    } else {
        // Alta
        agenda.agregarContacto(nombre, apellido, telefono, email);
    }

    renderizarContactos(agenda.obtenerContactos());
    dialogo.close();
});

// --- Delegación para Editar y Borrar ---
document.getElementById('contactos-lista').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const id = parseInt(btn.dataset.id);

    if (btn.classList.contains('editar-btn')) {
        // Buscar el contacto y precargar el formulario
        const contacto = agenda.contactos.find(c => c.id === id);
        if (contacto) {
            dialogoTitulo.textContent = 'Editar Contacto';
            contactoIdInput.value = contacto.id;
            document.getElementById('contacto-nombre').value = contacto.nombre;
            document.getElementById('contacto-apellido').value = contacto.apellido;
            document.getElementById('contacto-telefono').value = contacto.telefono;
            document.getElementById('contacto-email').value = contacto.email;
            dialogo.showModal();
        }
    }

    if (btn.classList.contains('borrar-btn')) {
        agenda.borrarContacto(id);
        renderizarContactos(agenda.obtenerContactos());
    }
});
