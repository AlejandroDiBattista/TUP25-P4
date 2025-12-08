'use strict';

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
  }
  agregar(contacto) {
    this.contactos.push(contacto);
  }
  actualizar(id, datos) {
    const idx = this.contactos.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.contactos[idx] = { ...this.contactos[idx], ...datos };
    }
  }
  borrar(id) {
    this.contactos = this.contactos.filter(c => c.id !== id);
  }
  buscar(texto) {
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
      if (ap === bp) {
        return a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' });
      }
      return ap.localeCompare(bp, 'es', { sensitivity: 'base' });
    });
  }
}

const agenda = new Agenda();
[
  ['1','Ana','García','111-1111','ana@gmail.com'],
  ['2','Aiquen','Ahumada','222-2222','aiquen@gmail.com'],
  ['3','Maira','Acosta','333-3333','maira@gmail.com'],
  ['4','Juan','Martínez','444-4444','juan@gmail.com'],
  ['5','Sofía','Rodríguez','555-5555','sofia@gmail.com'],
  ['6','Pedro','Sánchez','666-6666','pedro@gmail.com'],
  ['7','Lucía','Fernández','777-7777','lucia@gmail.com'],
  ['8','Carlos','Gómez','888-8888','carlos@gmail.com'],
  ['9','Elena','Díaz','999-9999','elena@gmail.com'],
  ['10','Miguel','Torres','101-0101','miguel@gmail.com']
].forEach(([id, nombre, apellido, telefono, email]) => {
  agenda.agregar(new Contacto(id, nombre, apellido, telefono, email));
});

const listado = document.getElementById('listadoContactos');
const buscador = document.getElementById('buscador');
const btnAgregar = document.getElementById('btnAgregar');
const dialogo = document.getElementById('dialogoContacto');
const form = document.getElementById('formContacto');
const tituloDialogo = document.getElementById('tituloDialogo');
const btnCancelar = document.getElementById('btnCancelar');

function renderizarContactos(contactos) {
  agenda.ordenar();
  listado.innerHTML = '';
  if (contactos.length === 0) {
    listado.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">No hay contactos para mostrar.</p>';
    return;
  }
  contactos.forEach(contacto => {
    const card = document.createElement('article');
    card.className = 'card-contacto';
    card.innerHTML = `
      <div class="nombre">${contacto.nombre} ${contacto.apellido}</div>
      <div class="datos">📞 ${contacto.telefono}</div>
      <div class="datos">✉️ ${contacto.email}</div>
      <div class="acciones">
        <button aria-label="Editar" data-id="${contacto.id}" class="editar" title="Editar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19.5 2 21l1.5-5L16.5 3.5z"/></svg>
        </button>
        <button aria-label="Borrar" data-id="${contacto.id}" class="borrar" title="Borrar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e11d48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        </button>
      </div>
    `;
    listado.appendChild(card);
  });
}

renderizarContactos(agenda.contactos);

buscador.addEventListener('input', e => {
  const texto = e.target.value;
  const resultados = texto ? agenda.buscar(texto) : agenda.contactos;
  renderizarContactos(resultados);
});

btnAgregar.addEventListener('click', () => {
  form.reset();
  tituloDialogo.textContent = 'Nuevo contacto';
  document.getElementById('contactoId').value = '';
  dialogo.showModal();
});

btnCancelar.addEventListener('click', () => {
  dialogo.close();
});

form.addEventListener('submit', e => {
  e.preventDefault();
  const id = document.getElementById('contactoId').value;
  const nombre = document.getElementById('nombre').value.trim();
  const apellido = document.getElementById('apellido').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const email = document.getElementById('email').value.trim();
  if (id) {
    agenda.actualizar(id, { nombre, apellido, telefono, email });
  } else {
    const nuevoId = Date.now().toString();
    agenda.agregar(new Contacto(nuevoId, nombre, apellido, telefono, email));
  }
  renderizarContactos(agenda.contactos);
  dialogo.close();
});

listado.addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  if (btn.classList.contains('editar')) {
    const id = btn.dataset.id;
    const c = agenda.contactos.find(c => c.id === id);
    if (c) {
      tituloDialogo.textContent = 'Editar contacto';
      document.getElementById('contactoId').value = c.id;
      document.getElementById('nombre').value = c.nombre;
      document.getElementById('apellido').value = c.apellido;
      document.getElementById('telefono').value = c.telefono;
      document.getElementById('email').value = c.email;
      dialogo.showModal();
    }
  }
  if (btn.classList.contains('borrar')) {
    const id = btn.dataset.id;
    agenda.borrar(id);
    renderizarContactos(agenda.contactos);
  }
});

window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && dialogo.open) {
    dialogo.close();
  }
});
