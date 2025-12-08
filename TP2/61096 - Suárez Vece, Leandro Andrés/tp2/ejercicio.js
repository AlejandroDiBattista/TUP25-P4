'use strict';
import { contactos } from './contactos.js';

// Funciones generales

class Contacto {
    constructor(id, nombre, apellido, telefono, email) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.telefono = telefono;
        this.email = email;
    }
}

class Agenda {
    constructor() {
        this.contactos = [];
        this._cargarEjemplo();
    }

    _cargarEjemplo() {

        this.contactos = contactos.map(c => new Contacto(...c));
    }

    agregar(contacto) {
        this.contactos.push(contacto);
    }

    actualizar(contacto) {
        const idx = this.contactos.findIndex(c => c.id === contacto.id);
        if (idx !== -1) this.contactos[idx] = contacto; actualiza
    }

    borrar(id) {
        this.contactos = this.contactos.filter(c => c.id !== id);
    }

    buscar(texto) {
        if (!texto) return this.contactos;
        const normalizar = s => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
        const t = normalizar(texto);
        return this.contactos.filter(c =>
            normalizar(c.nombre).includes(t) ||
            normalizar(c.apellido).includes(t) ||
            normalizar(c.telefono).includes(t) ||
            normalizar(c.email).includes(t)
        );
    }

    ordenar() {
        this.contactos.sort((a, b) => {
            const ap = a.apellido.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
            const bp = b.apellido.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
            if (ap !== bp) return ap.localeCompare(bp);
            const an = a.nombre.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
            const bn = b.nombre.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
            return an.localeCompare(bn);
        });
    }
}

// --- UI ---
const agenda = new Agenda();
agenda.ordenar();

const listado = document.getElementById('listadoContactos');
const busqueda = document.getElementById('busqueda');
const btnAgregar = document.getElementById('btnAgregar');
const dialogo = document.getElementById('dialogoContacto');
const form = document.getElementById('formContacto');
const btnCancelar = document.getElementById('btnCancelar');

function renderizarContactos(filtro = '') {
    agenda.ordenar();
    const contactos = agenda.buscar(filtro);
    listado.innerHTML = '';

    if (contactos.length === 0) {
        const msg = document.createElement('p');
        msg.textContent = 'No se encontraron contactos.';
        msg.style.textAlign = 'center';
        msg.style.fontStyle = 'italic';
        msg.style.color = '#555';
        listado.appendChild(msg);
        return;
    }

    for (const c of contactos) {
        const card = document.createElement('div');
        card.className = 'card-contacto';
        card.innerHTML = `
        <h3>${c.nombre} ${c.apellido}</h3>
        <div><b>Tel:</b> ${c.telefono}</div>
        <div><b>Email:</b> ${c.email}</div>
        <div class="acciones">
          <button title="Editar" data-id="${c.id}" class="editar">✏️</button>
          <button title="Borrar" data-id="${c.id}" class="borrar">🗑️</button>
        </div>
    `;
        listado.appendChild(card);
    }
}


busqueda.addEventListener('input', e => {
    renderizarContactos(e.target.value);
});

btnAgregar.addEventListener('click', () => {
    form.reset();
    document.getElementById('contactoId').value = '';
    dialogo.showModal();
});

btnCancelar.addEventListener('click', () => {
    dialogo.close();
});

listado.addEventListener('click', e => {
    if (e.target.classList.contains('borrar')) {
        const id = Number(e.target.dataset.id);
        agenda.borrar(id);//
        renderizarContactos(busqueda.value);//
    } else if (e.target.classList.contains('editar')) {
        const id = Number(e.target.dataset.id);
        const c = agenda.contactos.find(c => c.id === id);
        if (c) {
            document.getElementById('contactoId').value = c.id;
            document.getElementById('nombre').value = c.nombre;
            document.getElementById('apellido').value = c.apellido;
            document.getElementById('telefono').value = c.telefono;
            document.getElementById('email').value = c.email;
            dialogo.showModal();
        }
    }
});

form.addEventListener('submit', e => {
    e.preventDefault();
    const id = document.getElementById('contactoId').value;
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const email = document.getElementById('email').value.trim();
    if (id) {
        agenda.actualizar(new Contacto(Number(id), nombre, apellido, telefono, email));
    } else {
        const nuevoId = agenda.contactos.length ? Math.max(...agenda.contactos.map(c => c.id)) + 1 : 1;
        agenda.agregar(new Contacto(nuevoId, nombre, apellido, telefono, email));
    }
    renderizarContactos(busqueda.value);
    dialogo.close();
});

// Inicial
renderizarContactos();
