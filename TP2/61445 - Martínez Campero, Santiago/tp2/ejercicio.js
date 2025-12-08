'use strict';

const contenedorTarjetas = document.getElementById('cards');
const inputBusqueda = document.getElementById('buscar');
const botonAgregar = document.getElementById('btnAgregar');


function normalizarTexto(texto){
  return (texto || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function generarId(){
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

class Contacto{
  constructor({ id = generarId(), nombre, apellido, telefono = '', email = '' }){
    this.id = id; this.nombre = nombre; this.apellido = apellido; this.telefono = telefono; this.email = email;
  }
}

class Agenda{
  constructor(items = []){ this.items = items.map(c => new Contacto(c)); }
  agregar(data){ this.items.push(new Contacto(data)); }
  borrar(id){ this.items = this.items.filter(c => c.id !== id); }
  actualizar(id, data){ this.items = this.items.map(c => c.id === id ? new Contacto({ ...c, ...data, id }) : c); }
  ordenados(){
    return [...this.items].sort((a,b)=>
      normalizarTexto(a.apellido).localeCompare(normalizarTexto(b.apellido)) ||
      normalizarTexto(a.nombre).localeCompare(normalizarTexto(b.nombre))
    );
  }
  filtrar(texto){
    const lista = this.ordenados();
    const t = normalizarTexto(texto);
    if(!t) return lista;
    return lista.filter(c => normalizarTexto(`${c.nombre} ${c.apellido} ${c.telefono} ${c.email}`).includes(t));
  }
}

function obtenerContactosIniciales(){
  const base = [
    { nombre: 'Diego', apellido: 'Díaz', telefono: '11-5555-8080', email: 'diego.diaz@example.com' },
    { nombre: 'Valentina', apellido: 'Fernández', telefono: '11-5555-9090', email: 'valen.fernandez@example.com' },
    { nombre: 'María', apellido: 'García', telefono: '11-5555-2020', email: 'maria.garcia@example.com' },
    { nombre: 'Sofía', apellido: 'Gómez', telefono: '11-5555-7070', email: 'sofia.gomez@example.com' },
    { nombre: 'Ana', apellido: 'López', telefono: '11-5555-4040', email: 'ana.lopez@example.com' },
    { nombre: 'Lucía', apellido: 'Martínez', telefono: '11-5555-5050', email: 'lucia.martinez@example.com' },
    { nombre: 'Juan', apellido: 'Pérez', telefono: '', email: '' },
    { nombre: 'Carlos', apellido: 'Rodríguez', telefono: '', email: '' },
    { nombre: 'Mateo', apellido: 'Ruiz', telefono: '', email: '' },
    { nombre: 'Tomás', apellido: 'Santos', telefono: '', email: '' }
  ];
  return base.map(c => new Contacto(c));
}

function renderizarContactos(lista){
  if(!lista.length){
    contenedorTarjetas.innerHTML = '<div class="empty">No hay contactos para mostrar.</div>';
    return;
  }
  const html = lista.map((contacto)=> `
    <article class="card">
      <header style="display:flex;align-items:center;gap:.5rem;">
        <h3>${contacto.nombre} ${contacto.apellido}</h3>
      </header>
      <p>
        <span style="display:inline-flex;align-items:center;gap:.35rem;">📞 ${contacto.telefono || '—'}</span><br>
        <span style="display:inline-flex;align-items:center;gap:.35rem;">✉️ ${contacto.email || '—'}</span>
      </p>
      <footer style="display:flex;gap:.5rem;">
        <button data-action="editar" data-id="${contacto.id}" class="btn-icon contrast" aria-label="Editar ${contacto.nombre} ${contacto.apellido}">✏️ <span>Editar</span></button>
        <button data-action="borrar" data-id="${contacto.id}" class="btn-icon secondary" aria-label="Borrar ${contacto.nombre} ${contacto.apellido}">🗑️ <span>Borrar</span></button>
      </footer>
    </article>
  `).join('');
  contenedorTarjetas.innerHTML = html;
}

const agenda = new Agenda(obtenerContactosIniciales());
let editandoId = null;
renderizarContactos(agenda.ordenados());

inputBusqueda.addEventListener('input', () => {
  renderizarContactos(agenda.filtrar(inputBusqueda.value));
});

const dialogo = document.getElementById('contactDialog');
const formulario = document.getElementById('contactForm');
const tituloDialogo = document.getElementById('dialogTitle');
const inputNombre = document.getElementById('Nombre');
const inputApellido = document.getElementById('Apellido');
const inputTelefono = document.getElementById('Telefono');
const inputEmail = document.getElementById('Email');
const botonCancelar = document.getElementById('btnCancelar');

botonAgregar.addEventListener('click', () => {
  editandoId = null;
  tituloDialogo.textContent = 'Nuevo contacto';
  formulario.reset();
  dialogo.showModal();
  setTimeout(() => inputNombre.focus(), 0);
});

botonCancelar.addEventListener('click', () => {
  editandoId = null;
  dialogo.close();
});

formulario.addEventListener('submit', (e) => {
  e.preventDefault();
  if(!formulario.reportValidity()) return;
  const nombre = inputNombre.value.trim();
  const apellido = inputApellido.value.trim();
  const telefono = inputTelefono.value.trim();
  const email = inputEmail.value.trim();
  if(editandoId){
    agenda.actualizar(editandoId, { nombre, apellido, telefono, email });
  } else {
    agenda.agregar({ nombre, apellido, telefono, email });
  }
  editandoId = null;
  dialogo.close();
  renderizarContactos(agenda.filtrar(inputBusqueda.value));
});

contenedorTarjetas.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if(!btn) return;
  const id = btn.dataset.id;
  if(btn.dataset.action === 'borrar'){
    agenda.borrar(id);
    renderizarContactos(agenda.filtrar(inputBusqueda.value));
  }
  if(btn.dataset.action === 'editar'){
    const c = agenda.items.find(x => x.id === id);
    if(!c) return;
    editandoId = id;
    tituloDialogo.textContent = 'Editar contacto';
    inputNombre.value = c.nombre || '';
    inputApellido.value = c.apellido || '';
    inputTelefono.value = c.telefono || '';
    inputEmail.value = c.email || '';
  dialogo.showModal();
  setTimeout(() => inputNombre.focus(), 0);
  }
});



