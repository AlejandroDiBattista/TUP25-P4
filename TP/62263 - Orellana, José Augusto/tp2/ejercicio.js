'use strict';
// Funciones generales
// Normalización para la búsqueda
function normalizar(texto)  {
    return String(texto ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

class Contacto {
    constructor({ id = null, nombre = '', apellido = '', telefono = '', email = ''} = {}) {
        this.id = id == null ? null : Number(id);
        this.nombre = String(nombre).trim(),
        this.apellido = String(apellido).trim(),
        this.telefono = String(telefono).trim();
        this.email = String(email).trim();
    }
}

class Agenda {
    #items = [];
    #proximoId = 1;

    constructor(contactosIniciales = []) {
        if (!Array.isArray(contactosIniciales)) throw new TypeError('contactosIniciales debe ser un array');

        // Cargar contactos iniciales
        contactosIniciales.forEach(c => this.#agregarInterno(new Contacto(c)));

        const maxId = this.#items.reduce((max, c) => Math.max(max, c.id ?? 0), 0);
        this.#proximoId = Math.max(1, maxId + 1);

        this.#ordenar();
    }

    get todos() {
        return [...this.#items].sort(this.#comparador());
    }

    agregar({ nombre = '', apellido = '', telefono = '', email = ''} = {}) {
        if (!nombre.trim() || !apellido.trim()) throw new Error('Nombre y apellido son obligatorios');

        const contacto = new Contacto({
            id: this.#proximoId,
            nombre,
            apellido,
            telefono,
            email,
        });
        this.#items.push(contacto);
        this.#ordenar();
        return contacto;
    }

    actualizar(id, cambios = {}) {
        const idx = this.#items.findIndex(c => c.id === Number(id));
        if (idx === -1) throw new Error(`No existe el contacto con id: ${id}`);

        const actual = this.#items[idx];
        const actualizado = new Contacto({
            id: actual.id,
            nombre: cambios.nombre != null ? cambios.nombre : actual.nombre,
            apellido: cambios.apellido != null ? cambios.apellido : actual.apellido,
            telefono: cambios.telefono != null ? cambios.telefono : actual.telefono,
            email: cambios.email != null ? cambios.email : actual.email,
        });

        if (!actualizado.nombre.trim() || !actualizado.apellido.trim()) throw new Error('Nombre y apellido son obligatorios');

        this.#items[idx] = actualizado;
        this.#ordenar();
        return actualizado;
    }

    borrar(id) {
        const i = this.#items.findIndex(c => c.id === Number(id));
        if (i === -1) return false;
        this.#items.splice(i, 1);
        return true;
    }

    buscar(texto = '') {
        const q = normalizar(texto);
        if (!q) return this.todos;

        return this.#items
            .filter(c => {
                const campos = [
                    normalizar(c.nombre),
                    normalizar(c.apellido),
                    normalizar(c.telefono),
                    normalizar(c.email),
                ];
                return campos.some(t => t.includes(q));
            })
            .sort(this.#comparador());
    }

    #agregarInterno(contacto) {
        if (contacto.id == null) contacto.id = this.#proximoId;

        this.#items.push(contacto);
    }

    #ordenar() {
        this.#items.sort(this.#comparador());
    }

    #comparador() {
        return (a, b) =>
            normalizar(a.apellido).localeCompare(normalizar(b.apellido)) ||
            normalizar(a.nombre).localeCompare(normalizar(b.nombre));
    }
}

// Contacto
const SEED_CONTACTOS = [
    { nombre: "Ana",      apellido: "García",    telefono: "381 555-1001", email: "ana.garcia@mail.com" },
    { nombre: "José",     apellido: "Muñoz",     telefono: "381 555-1002", email: "jose.munoz@mail.com" },
    { nombre: "Lucía",    apellido: "Pérez",     telefono: "381 555-1003", email: "lucia.perez@mail.com" },
    { nombre: "Martín",   apellido: "Gómez",     telefono: "381 555-1004", email: "martin.gomez@mail.com" },
    { nombre: "Sofía",    apellido: "Díaz",      telefono: "381 555-1005", email: "sofia.diaz@mail.com" },
    { nombre: "Andrés",   apellido: "Núñez",     telefono: "381 555-1006", email: "andres.nunez@mail.com" },
    { nombre: "Camila",   apellido: "Rodríguez", telefono: "381 555-1007", email: "camila.rodriguez@mail.com" },
    { nombre: "Nicolás",  apellido: "Álvarez",   telefono: "381 555-1008", email: "nicolas.alvarez@mail.com" },
    { nombre: "Valentina",apellido: "Sánchez",   telefono: "381 555-1009", email: "valentina.sanchez@mail.com" },
    { nombre: "Diego",    apellido: "Fernández", telefono: "381 555-1010", email: "diego.fernandez@mail.com" },
];

// (Opcional) Instancia global para probar en consola ahora mismo
if (typeof window !== "undefined" && !window.agenda) {
    window.agenda = Agenda;
    window.Contacto = Contacto;
    window.normalizar = normalizar;
    window.SEED_CONTACTOS = SEED_CONTACTOS;
    window.agenda = new Agenda(SEED_CONTACTOS);
    // console.log("Agenda lista:", window.agenda.todos);
}

// Renderizado 
document.addEventListener('DOMContentLoaded', () => {
    const lista = document.getElementById('listarContactos');
    const buscador = document.getElementById('buscar');

    const dialogo = document.getElementById('dialogoContacto');
    const form = document.getElementById('formContacto');
    const btnAgregar = document.getElementById('btnAgregar');
    const btnCancelar = document.getElementById('btnCancelar');
    const tituloDialogo = document.getElementById('tituloDialogo');

    // Función que pinta los contactos en pantalla
    function renderContactos(contactos) {
        lista.innerHTML = '';
        if (contactos.length === 0) {
            lista.innerHTML = '<p>No hay contactos para mostrar</p>';
            return;
        }

        contactos.forEach(c => {
            const card = document.createElement('article');
            card.innerHTML = `
                <header>
                    <strong>${c.nombre} ${c.apellido}</strong>
                </header>
                <p>📞 ${c.telefono}</p>
                <p>📧 ${c.email}</p>
                <footer>
                    <button class="editar" data-id="${c.id}">
                        ✏️
                    </button>
                    <button class="borrar" data-id="${c.id}">
                        🗑️
                    </button>
                </footer>
            `;
            lista.appendChild(card);
        });
    }

    // Mostrar
    renderContactos(agenda.todos);

    // Buscador 
    buscador.addEventListener('input', e => {
        const texto = e.target.value;
        const resultados = agenda.buscar(texto);
        renderContactos(resultados);
    });

    lista.addEventListener('click', e => {
        if (e.target.classList.contains('borrar')) {
            const id = e.target.dataset.id;
            agenda.borrar(id);
            renderContactos(agenda.buscar(buscador.value));
        }

        if (e.target.classList.contains('editar')) {
            const id = e.target.dataset.id;
            const contacto = agenda.todos.find(c => c.id === Number(id));
            
            document.getElementById("contactoId").value = contacto.id;
            document.getElementById("nombre").value = contacto.nombre;
            document.getElementById("apellido").value = contacto.apellido;
            document.getElementById("telefono").value = contacto.telefono;
            document.getElementById("email").value = contacto.email;
            
            tituloDialogo.textContent = "Editar contacto";
            dialogo.showModal();
        }
    });

    // Modal de nuevo contacto
    btnAgregar.addEventListener('click', () => {
        form.reset();
        document.getElementById('contactoId').value = '';
        tituloDialogo.textContent = 'Nuevo contacto';
        dialogo.showModal();
    });

    // Cancelar
    btnCancelar.addEventListener('click', () => {
        dialogo.close();
    });

    // Guardar contacto
    form.addEventListener('submit', e => {
        e.preventDefault();

        const id = document.getElementById("contactoId").value;
        const nombre = document.getElementById("nombre").value;
        const apellido = document.getElementById("apellido").value;
        const telefono = document.getElementById("telefono").value;
        const email = document.getElementById("email").value;

        if (id) agenda.actualizar(id, { nombre, apellido, telefono, email });
        else agenda.agregar({ nombre, apellido, telefono, email });

        renderContactos(agenda.buscar(buscador.value));
        dialogo.close();
    });
});