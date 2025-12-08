import { prompt, read, write } from './io.js';

class Contacto {
  constructor({ id, nombre, apellido, edad, telefono, email } = {}) {
    this.id = id ?? null;
    this.nombre = nombre ?? '';
    this.apellido = apellido ?? '';
    this.edad = (edad === '' || edad === undefined || edad === null) ? null : Number(edad);
    this.telefono = telefono ?? '';
    this.email = email ?? '';
  }
  nombreCompleto() {
    return `${this.apellido}, ${this.nombre}`.trim();
  }
  coincideCon(q) {
    const t = String(q || '').toLowerCase();
    const campos = [
      String(this.id ?? ''),
      this.nombre,
      this.apellido,
      this.nombreCompleto(),
      this.edad != null ? String(this.edad) : '',
      this.telefono,
      this.email,
    ].join(' ').toLowerCase();
    return campos.includes(t);
  }
}

class Agenda {
  constructor() {
    this.contactos = [];
    this.nextId = 1;
  }

  agregar(contacto) {
    const errores = this._validar(contacto);
    if (errores.length) return { ok: false, errores };

    const nuevo = new Contacto({
      id: this.nextId++,
      nombre: contacto.nombre?.trim(),
      apellido: contacto.apellido?.trim(),
      edad: contacto.edad === '' ? null : Number(contacto.edad),
      telefono: contacto.telefono?.trim(),
      email: contacto.email?.trim(),
    });
    this.contactos.push(nuevo);
    return { ok: true, contacto: nuevo };
  }

  static async cargar() {
    const ag = new Agenda();
    try {
      const raw = await read('tp/61338 - Morales, Juan Daniel/tp1/agenda.json');
      if (!raw) return ag;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        ag.contactos = parsed.map(c => new Contacto(c));
        ag.nextId = ag._calcNextId();
      } else if (parsed && typeof parsed === 'object') {
        ag.nextId = Number(parsed.nextId) || 1;
        ag.contactos = Array.isArray(parsed.contactos) ? parsed.contactos.map(c => new Contacto(c)) : [];
        ag.nextId = Math.max(ag.nextId, ag._calcNextId());
      }
    } catch (e) {
      console.error('Error al cargar la agenda:', e);
      ag.contactos = [];
      ag.nextId = 1;
    }
    return ag;
  }

  async guardar() {
    const data = { nextId: this.nextId, contactos: this.contactos };
    await write(JSON.stringify(data, null, 2), 'tp/61338 - Morales, Juan Daniel/tp1/agenda.json');
  }

  _calcNextId() {
    const maxId = this.contactos.reduce((m, c) => Math.max(m, Number(c.id) || 0), 0);
    return maxId + 1;
  }

  _validar({ nombre, apellido, edad, telefono, email }, { parcial = false } = {}) {
    const errs = [];
    const vacio = (v) => v === undefined || v === null || String(v).trim() === '';

    if (!parcial || (!vacio(nombre) && parcial)) if (vacio(nombre)) errs.push('El nombre es obligatorio.');
    if (!parcial || (!vacio(apellido) && parcial)) if (vacio(apellido)) errs.push('El apellido es obligatorio.');

    if (!parcial || (!vacio(edad) && parcial)) {
      if (!vacio(edad)) {
        const n = Number(edad);
        if (!Number.isFinite(n) || n < 0 || n > 130) errs.push('La edad debe ser un número válido (0-130).');
      }
    }
    if (!parcial || (!vacio(telefono) && parcial)) {
      if (!vacio(telefono) && String(telefono).trim().length < 5) errs.push('El teléfono es demasiado corto.');
    }
    if (!parcial || (!vacio(email) && parcial)) {
      if (!vacio(email)) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(String(email).trim())) errs.push('El email no tiene un formato válido.');
      }
    }
    return errs;
  }

  editar(id, parciales) {
    const c = this.buscarPorId(id);
    if (!c) return { ok: false, error: 'No existe un contacto con ese ID.' };

    const errores = this._validar(parciales, { parcial: true });
    if (errores.length) return { ok: false, errores };

    if (parciales.nombre !== undefined && parciales.nombre !== '') c.nombre = parciales.nombre;
    if (parciales.apellido !== undefined && parciales.apellido !== '') c.apellido = parciales.apellido;
    if (parciales.edad !== undefined && parciales.edad !== '') {
      const n = Number(parciales.edad);
      if (Number.isFinite(n)) c.edad = n;
    }
    if (parciales.telefono !== undefined && parciales.telefono !== '') c.telefono = parciales.telefono;
    if (parciales.email !== undefined && parciales.email !== '') c.email = parciales.email;

    return { ok: true, contacto: c };
  }

  borrar(id) {
    const idx = this.contactos.findIndex((c) => c.id === id);
    if (idx === -1) return { ok: false, error: 'No existe un contacto con ese ID.' };
    const [rem] = this.contactos.splice(idx, 1);
    return { ok: true, contacto: rem };
  }

  buscarPorId(id) {
    return this.contactos.find((c) => c.id === id);
  }

  listarOrdenado() {
    const es = { sensitivity: 'base', usage: 'sort' };
    return [...this.contactos].sort((a, b) => {
      const cmpApe = (a.apellido || '').localeCompare(b.apellido || '', 'es', es);
      if (cmpApe !== 0) return cmpApe;
      return (a.nombre || '').localeCompare(b.nombre || '', 'es', es);
    });
  }

  listarPorId() {
    return [...this.contactos].sort(
      (a, b) => (Number(a.id) || 0) - (Number(b.id) || 0)
    );
  }

  buscarPorContenido(q) {
    if (!q || !q.trim()) return [];
    return this.listarPorId().filter((c) => c.coincideCon(q));
  }
}

const LABEL_W = 12;
const pad = (s, w) => String(s ?? '').padEnd(w, ' ');
const label = (t) => `${pad(t, LABEL_W)}:> `;
const padId = (id) => String(id).padStart(2, '0');

function renderTabla(contactos) {
  const headers = ['ID', 'Nombre Completo', 'Edad', 'Teléfono', 'Email'];
  const rows = contactos.map((c) => [
    padId(c.id),
    c.nombreCompleto(),
    c.edad != null ? String(c.edad) : '',
    c.telefono,
    c.email,
  ]);

  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => (r[i] ? r[i].length : 0)))
  );
  const line = (cols) => cols.map((v, i) => pad(v, widths[i] + 2)).join('');
  let out = '';
  out += line(headers) + '\n';
  out += rows.map((r) => line(r)).join('\n');
  return out;
}

async function pausa() {
  await prompt('\nPresione Enter para continuar...');
}
function separador() {
  console.log('\n-----\n');
}

async function uiListar(agenda) {
  console.log('== Lista de contactos ==');
  const lista = agenda.listarPorId();
  if (!lista.length) {
    console.log('(sin contactos)');
  } else {
    console.log(renderTabla(lista));
  }
  await pausa();
}

async function uiAgregar(agenda) {
  console.log('== Agregando contacto ==');
  const nombre = await prompt(label('Nombre'));
  const apellido = await prompt(label('Apellido'));
  const edad = await prompt(label('Edad'));
  const telefono = await prompt(label('Teléfono'));
  const email = await prompt(label('Email'));

  const res = agenda.agregar({ nombre, apellido, edad, telefono, email });
  if (!res.ok) {
    console.log('\nNo se pudo agregar:');
    res.errores.forEach((e) => console.log(' - ' + e));
  } else {
    await agenda.guardar();
  }
  await pausa();
}

async function uiBuscar(agenda) {
  console.log('== Buscar contacto ==');
  const q = await prompt(label('Buscar'));
  console.log('');
  const r = agenda.buscarPorContenido(q);
  if (!r.length) {
    console.log('(sin resultados)');
  } else {
    console.log(renderTabla(r));
  }
  await pausa();
}

async function uiEditar(agenda) {
  console.log('== Editar contacto ==');
  const idStr = await prompt(label('ID contacto'));
  const id = Number(idStr);
  if (!Number.isInteger(id)) {
    console.log('\nID inválido.');
    return await pausa();
  }
  const c = agenda.buscarPorId(id);
  if (!c) {
    console.log('\nNo existe un contacto con ese ID.');
    return await pausa();
  }

  console.log(`\nEditando [${padId(c.id)}] ${c.nombreCompleto()}`);
  console.log('Deje vacío para mantener el valor actual.');
  const nombre = await prompt(label(`Nombre (${c.nombre})`));
  const apellido = await prompt(label(`Apellido (${c.apellido})`));
  const edad = await prompt(label(`Edad (${c.edad != null ? c.edad : 'sin dato'})`));
  const telefono = await prompt(label(`Teléfono (${c.telefono})`));
  const email = await prompt(label(`Email (${c.email})`));

  const res = agenda.editar(id, { nombre, apellido, edad, telefono, email });
  if (!res.ok) {
    console.log('\nNo se pudo editar:');
    (res.errores || [res.error]).forEach((e) => console.log(' - ' + e));
  } else {
    await agenda.guardar();
    console.log('\nActualizado.');
  }
  await pausa();
}

async function uiBorrar(agenda) {
  console.log('== Borrar contacto ==');
  const idStr = await prompt(label('ID contacto'));
  const id = Number(idStr);
  if (!Number.isInteger(id)) {
    console.log('\nID inválido.');
    return await pausa();
  }
  const c = agenda.buscarPorId(id);
  if (!c) {
    console.log('\nNo existe un contacto con ese ID.');
    return await pausa();
  }

  console.log('\nBorrando...');
  console.log(renderTabla([c]));
  const conf = (await prompt('¿Confirma borrado? :> S/N ')).toLowerCase();
  if (conf === 's' || conf === 'si' || conf === 'sí') {
    const res = agenda.borrar(id);
    if (res.ok) {
      await agenda.guardar();
      console.log('\nContacto borrado.');
    } else {
      console.log('\n' + res.error);
    }
  } else {
    console.log('\nOperación cancelada.');
  }
  await pausa();
}

async function main() {
  const agenda = await Agenda.cargar();

  let salir = false;
  while (!salir) {
    console.log('=== AGENDA DE CONTACTOS ===');
    console.log('1. Listar');
    console.log('2. Agregar');
    console.log('3. Editar');
    console.log('4. Borrar');
    console.log('5. Buscar');
    console.log('0. Finalizar');

    const opcion = await prompt('\nIngresar opción :> ');

    separador();

    switch (opcion) {
      case '1':
        await uiListar(agenda);
        break;
      case '2':
        await uiAgregar(agenda);
        break;
      case '3':
        await uiEditar(agenda);
        break;
      case '4':
        await uiBorrar(agenda);
        break;
      case '5':
        await uiBuscar(agenda);
        break;
      case '0':
        salir = true;
        break;
      default:
        console.log('Opción no válida.');
        await pausa();
    }

    if (!salir) separador();
  }
}

(async () => {
  await main();
})();