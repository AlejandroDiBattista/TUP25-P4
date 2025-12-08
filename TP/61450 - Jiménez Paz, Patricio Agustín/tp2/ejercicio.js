'use strict';
// Funciones generales
class Contacto {
    #id;
    #nombre;
    #apellido;
    #telefono;
    #email;

    constructor({ id = null, nombre = '', apellido = '', telefono = '', email = '' } = {}) {
        this.#id = id == null ? null : Number(id);
        this.#nombre = String(nombre || '').trim();
        this.#apellido = String(apellido || '').trim();
        this.#telefono = String(telefono || '').trim();
        this.#email = String(email || '').trim();
    }

    get id() {
        return this.#id;
    }
    set id(value) {
        if (this.#id != null) {
            throw new Error('ID no puede ser modificado una vez asignado');
        }
        const n = Number(value);
        if (Number.isNaN(n) || n <= 0) throw new Error('ID inválido');
        this.#id = n;
    }

    get nombre() { return this.#nombre; }
    set nombre(v) { this.#nombre = String(v || '').trim(); }

    get apellido() { return this.#apellido; }
    set apellido(v) { this.#apellido = String(v || '').trim(); }

    get telefono() { return this.#telefono; }
    set telefono(v) { this.#telefono = String(v || '').trim(); }

    get email() { return this.#email; }
    set email(v) { this.#email = String(v || '').trim(); }

    get nombreCompleto() {
        return `${this.#apellido}, ${this.#nombre}`.trim();
    }
}

class Agenda {
    #contactos;
    static #proximoId = 1;

    constructor(contactos = []) {
        this.#contactos = contactos;
    }

    static obtenerId() {
        return Agenda.#proximoId++;
    }

    agregar(contacto) {
        if (!contacto.id) contacto.id = Agenda.obtenerId();
        this.#contactos.push(contacto);
        return contacto;
    }

    buscarPorId(id) {
        return this.#contactos.find(c => String(c.id) === String(id)) || null;
    }

    // Editar: reemplaza los campos no vacíos
    editar(id, nuevosCampos = {}) {
        const c = this.buscarPorId(id);
        if (!c) return null;
        Object.keys(nuevosCampos).forEach(k => {
            const v = nuevosCampos[k];
            if (v !== undefined && v !== null && String(v).trim() !== '') c[k] = v;
        });
        return c;
    }

    // Borrar por id, devuelve el eliminado o null si no existe
    borrar(id) {
        const idx = this.#contactos.findIndex(c => String(c.id) === String(id));
        if (idx === -1) return null;
        return this.#contactos.splice(idx, 1)[0];
    }

    // Listar ordenado por apellido, luego nombre
    listarOrdenado() {
        return [...this.#contactos].sort((a, b) => {
            const ap = String(a.apellido || '').localeCompare(String(b.apellido || ''), 'es', { sensitivity: 'base' });
            if (ap !== 0) return ap;
            return String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es', { sensitivity: 'base' });
        });
    }

    buscar(texto) {
        const q = String(texto || '').toLowerCase();
        return this.#contactos.filter(c => {
            return (
                String(c.nombre || '').toLowerCase().includes(q) ||
                String(c.apellido || '').toLowerCase().includes(q) ||
                String(c.email || '').toLowerCase().includes(q) ||
                String(c.telefono || '').toLowerCase().includes(q) ||
                String(c.edad || '').toLowerCase().includes(q)
            );
        });
    }
}


// ------------------ UI / App logic (no modificar las clases arriba) ------------------

// Normaliza texto para búsqueda insensible a mayúsculas y acentos
const normalizar = (s) => String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

// Instancia de agenda en memoria
const agenda = new Agenda();

// Crear 10 contactos de ejemplo
const ejemploNombres = [
    ['María', 'García'], ['Juan', 'Pérez'], ['Ana', 'López'], ['Carlos', 'Gómez'], ['Lucía', 'Martínez'],
    ['Pedro', 'Sánchez'], ['Sofía', 'Romero'], ['Martín', 'Diaz'], ['Laura', 'Fernández'], ['Diego', 'Alvarez']
];
function cargarEjemplos() {
    ejemploNombres.forEach((pair, i) => {
        const c = new Contacto({
            nombre: pair[0],
            apellido: pair[1],
            telefono: `+54 9 11 15${1000 + i}`,
            email: `${pair[0].toLowerCase()}.${pair[1].toLowerCase()}@ejemplo.com`
        });
        agenda.agregar(c);
    });
}

// Elementos del DOM
const $lista = document.getElementById('lista');
const $buscar = document.getElementById('buscar');
const $btnAgregar = document.getElementById('btnAgregar');
const $dialog = document.getElementById('dialogoContacto');
const $form = document.getElementById('formContacto');
const $dialogTitulo = document.getElementById('dialogTitulo');
const $contactoId = document.getElementById('contactoId');
const $nombre = document.getElementById('nombre');
const $apellido = document.getElementById('apellido');
const $telefono = document.getElementById('telefono');
const $email = document.getElementById('email');

// Render de tarjetas
function render(contactos) {
    const lista = contactos || agenda.listarOrdenado();
    $lista.innerHTML = '';
    if (lista.length === 0) {
        $lista.innerHTML = '<p>No hay contactos.</p>';
        return;
    }
    lista.forEach(c => {
        const card = document.createElement('article');
        card.className = 'card';
        const cardHeader = document.createElement('header');
        const h = document.createElement('h3');
        h.textContent = `${c.nombre} ${c.apellido}`;
        cardHeader.appendChild(h);
        const meta = document.createElement('div');
        meta.className = 'meta';
        meta.innerHTML = `<div><i class="fa-solid fa-phone"></i> ${c.telefono || '—'}</div><div><i class="fa-solid fa-envelope"></i> ${c.email || '—'}</div>`;
        const actions = document.createElement('div');
        actions.className = 'actions';

        const btnEditar = document.createElement('button');
        const iconEditar = document.createElement('i');
        iconEditar.className = 'fa-solid fa-pencil';
        btnEditar.className = 'icon-btn';
        btnEditar.title = 'Editar';
        btnEditar.appendChild(iconEditar);
        btnEditar.addEventListener('click', () => abrirDialogoEditar(c.id));

        const btnBorrar = document.createElement('button');
        const iconBorrar = document.createElement('i');
        iconBorrar.className = 'fa-solid fa-trash';
        btnBorrar.className = 'icon-btn';
        btnBorrar.title = 'Borrar';
        btnBorrar.appendChild(iconBorrar);
        btnBorrar.addEventListener('click', () => {
            agenda.borrar(c.id);
            aplicarFiltro();
        });

        actions.appendChild(btnEditar);
        actions.appendChild(btnBorrar);

        card.appendChild(cardHeader);
        card.appendChild(meta);
        card.appendChild(actions);
        $lista.appendChild(card);
    });
}

// Búsqueda con normalización (sin acentos ni mayúsculas)
function aplicarFiltro() {
    const q = normalizar($buscar.value);
    if (!q) {
        render(agenda.listarOrdenado());
        return;
    }
    const filtrados = agenda.listarOrdenado().filter(c => {
        return [c.nombre, c.apellido, c.email, c.telefono].some(f => normalizar(f).includes(q));
    });
    render(filtrados);
}

// Abrir diálogo para nuevo contacto
function abrirDialogoNuevo() {
    $dialogTitulo.textContent = 'Nuevo contacto';
    $contactoId.value = '';
    $nombre.value = '';
    $apellido.value = '';
    $telefono.value = '';
    $email.value = '';
    $dialog.showModal();
}

// Abrir diálogo para editar
function abrirDialogoEditar(id) {
    const c = agenda.buscarPorId(id);
    if (!c) return;
    $dialogTitulo.textContent = 'Editar contacto';
    $contactoId.value = c.id;
    $nombre.value = c.nombre || '';
    $apellido.value = c.apellido || '';
    $telefono.value = c.telefono || '';
    $email.value = c.email || '';
    $dialog.showModal();
}

// Guardar (alta o edición)
function guardarDesdeFormulario() {
    const id = $contactoId.value ? String($contactoId.value) : '';
    const datos = {
        nombre: $nombre.value.trim(),
        apellido: $apellido.value.trim(),
        telefono: $telefono.value.trim(),
        email: $email.value.trim()
    };
    if (!datos.nombre || !datos.apellido) {
        // requeridos
        $nombre.reportValidity();
        $apellido.reportValidity();
        return false;
    }
    if (id) {
        agenda.editar(id, datos);
    } else {
        const c = new Contacto(datos);
        agenda.agregar(c);
    }
    aplicarFiltro();
    return true;
}

// Eventos
$buscar.addEventListener('input', () => aplicarFiltro());
$btnAgregar.addEventListener('click', () => abrirDialogoNuevo());

document.getElementById('btnGuardar').addEventListener('click', () => {
    const ok = guardarDesdeFormulario();
    if (ok) $dialog.close();
});
document.getElementById('btnCancelar').addEventListener('click', () => $dialog.close());

// Inicialización
(function init() {
    cargarEjemplos();
    render(agenda.listarOrdenado());
})();
