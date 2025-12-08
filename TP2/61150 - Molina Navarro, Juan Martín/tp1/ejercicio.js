import {prompt, read, write} from './io.js';

class Contacto {
  constructor() {
    this.id = 0;
    this.nombre = '';
    this.apellido = '';
    this.edad = 0;
    this.telefono = '';
    this.email = '';
  }
  nombreCompleto() {
    return (this.apellido || '') + ', ' + (this.nombre || '');
  }
}

class Agenda {
  constructor() {
    this.contactos = [];
  }

  agregar(contacto) {
    var max = 0;
    for (var i = 0; i < this.contactos.length; i++) {
      var idc = Number(this.contactos[i].id);
      if (idc > max) max = idc;
    }
    var c = new Contacto();
    c.id = max + 1;
    c.nombre = (contacto && contacto.nombre) ? String(contacto.nombre).trim() : '';
    c.apellido = (contacto && contacto.apellido) ? String(contacto.apellido).trim() : '';
    c.edad = contacto && contacto.edad !== undefined && contacto.edad !== null && contacto.edad !== '' ? Number(contacto.edad) : 0;
    c.telefono = (contacto && contacto.telefono) ? String(contacto.telefono).trim() : '';
    c.email = (contacto && contacto.email) ? String(contacto.email).trim() : '';
    this.contactos.push(c);
    return c;
  }

  listarOrdenados() {
    var copia = this.contactos.slice();
    copia.sort(function(a, b) {
      var aa = (a.apellido || '').toUpperCase();
      var ab = (b.apellido || '').toUpperCase();
      if (aa < ab) return -1;
      if (aa > ab) return 1;
      var na = (a.nombre || '').toUpperCase();
      var nb = (b.nombre || '').toUpperCase();
      if (na < nb) return -1;
      if (na > nb) return 1;
      return 0;
    });
    return copia;
  }

  buscar(texto) {
    var q = (texto || '').toString().toLowerCase();
    var lista = this.listarOrdenados();
    if (!q) return lista;
    var res = [];
    for (var i = 0; i < lista.length; i++) {
      var c = lista[i];
      var cadena = (c.id + ' ' + (c.nombre||'') + ' ' + (c.apellido||'') + ' ' + (c.edad||'') + ' ' + (c.telefono||'') + ' ' + (c.email||''))
                  .toLowerCase();
      if (cadena.indexOf(q) >= 0) res.push(c);
    }
    return res;
  }

  porId(id) {
    var n = Number(id);
    for (var i = 0; i < this.contactos.length; i++) {
      if (Number(this.contactos[i].id) === n) return this.contactos[i];
    }
    return null;
  }

  editar(id, datos) {
    var c = this.porId(id);
    if (!c) return null;
    if (datos) {
      if (datos.nombre !== undefined && datos.nombre !== '') c.nombre = String(datos.nombre);
      if (datos.apellido !== undefined && datos.apellido !== '') c.apellido = String(datos.apellido);
      if (datos.edad !== undefined && datos.edad !== null && datos.edad !== '') c.edad = Number(datos.edad);
      if (datos.telefono !== undefined && datos.telefono !== '') c.telefono = String(datos.telefono);
      if (datos.email !== undefined && datos.email !== '') c.email = String(datos.email);
    }
    return c;
  }

  borrar(id) {
    var n = Number(id);
    for (var i = 0; i < this.contactos.length; i++) {
      if (Number(this.contactos[i].id) === n) {
        var eliminado = this.contactos[i];
        this.contactos.splice(i, 1);
        return eliminado;
      }
    }
    return null;
  }

  static async cargar() {
    try {
      var texto = await read('./agenda.json');
      if (!texto) texto = '[]';
      var arr;
      try { arr = JSON.parse(texto); } catch(e) { arr = []; }
      var ag = new Agenda();
      if (Array.isArray(arr)) {
        for (var i = 0; i < arr.length; i++) {
          var d = arr[i];
          var c = new Contacto();
          c.id = Number(d.id) || 0;
          c.nombre = d.nombre || '';
          c.apellido = d.apellido || '';
          c.edad = Number(d.edad) || 0;
          c.telefono = d.telefono || '';
          c.email = d.email || '';
          ag.contactos.push(c);
        }
      }
      return ag;
    } catch (err) {
      return new Agenda();
    }
  }

  async guardar() {
    var texto = JSON.stringify(this.contactos, null, 2);
    await write(texto, './agenda.json');
  }
}

function padDerecha(s, len) {
  s = (s === undefined || s === null) ? '' : String(s);
  while (s.length < len) s = s + ' ';
  if (s.length > len) s = s.substring(0, len);
  return s;
}

function id2(n) {
  n = Number(n) || 0;
  var s = String(n);
  while (s.length < 2) s = '0' + s;
  return s;
}

async function pausa() {
  await prompt('\nPresione Enter para continuar...');
}

function mostrarTabla(lista) {
  console.log('ID Nombre Completo             Edad   Teléfono        Email');
  for (var i = 0; i < lista.length; i++) {
    var c = lista[i];
    var linea = padDerecha(id2(c.id), 3) + ' ' +
                padDerecha((c.apellido||'') + ', ' + (c.nombre||''), 26) + ' ' +
                padDerecha(c.edad || '', 6) + ' ' +
                padDerecha(c.telefono || '', 15) + ' ' +
                padDerecha(c.email || '', 30);
    console.log(linea);
  }
}

async function leerNumero(msg, def) {
  while (true) {
    var r = await prompt(msg);
    if (r === '' && def !== undefined) return def;
    var n = Number(r);
    if (!isNaN(n)) return n;
    console.log('Ingrese un número válido.');
  }
}

async function leerTexto(msg, def) {
  var r = await prompt(msg);
  if (r === '' && def !== undefined) return def;
  return r;
}

async function main() {
  var agenda = await Agenda.cargar();
  var salir = false;
  while (!salir) {
    console.log('=== AGENDA DE CONTACTOS ===');
    console.log('1. Listar');
    console.log('2. Agregar');
    console.log('3. Editar');
    console.log('4. Borrar');
    console.log('5. Buscar');
    console.log('0. Finalizar');

    var op = await prompt('\nIngresar opción :> ');
    console.log('\n-----\n');

    if (op === '1') {
      console.log('== Lista de contactos ==');
      var lista = agenda.listarOrdenados();
      if (lista.length === 0) console.log('(sin contactos)');
      else mostrarTabla(lista);
      await pausa();
    } else if (op === '2') {
      console.log('== Agregando contacto ==');
      var nombre = await leerTexto('Nombre      :> ');
      var apellido = await leerTexto('Apellido    :> ');
      var edad = await leerNumero('Edad        :> ');
      var telefono = await leerTexto('Teléfono    :> ');
      var email = await leerTexto('Email       :> ');
      agenda.agregar({ nombre: nombre, apellido: apellido, edad: edad, telefono: telefono, email: email });
      await agenda.guardar();
      await pausa();
    } else if (op === '3') {
      console.log('== Editar contacto ==');
      var idE = await leerNumero('ID contacto :> ');
      var ce = agenda.porId(idE);
      if (!ce) {
        console.log('No existe un contacto con ese ID.');
        await pausa();
      } else {
        console.log('Actual:');
        mostrarTabla([ce]);
        var n2 = await leerTexto('Nombre    [' + (ce.nombre||'') + ']   :> ', ce.nombre||'');
        var a2 = await leerTexto('Apellido  [' + (ce.apellido||'') + '] :> ', ce.apellido||'');
        var e2 = await leerNumero('Edad      [' + (ce.edad||'') + '] :> ', ce.edad||0);
        var t2 = await leerTexto('Teléfono  [' + (ce.telefono||'') + '] :> ', ce.telefono||'');
        var m2 = await leerTexto('Email     [' + (ce.email||'') + ']    :> ', ce.email||'');
        agenda.editar(idE, { nombre: n2, apellido: a2, edad: e2, telefono: t2, email: m2 });
        await agenda.guardar();
        await pausa();
      }
    } else if (op === '4') {
      console.log('== Borrar contacto ==');
      var idB = await leerNumero('ID contacto :> ');
      var cb = agenda.porId(idB);
      if (!cb) {
        console.log('No existe un contacto con ese ID.');
        await pausa();
      } else {
        console.log('\nBorrando...');
        mostrarTabla([cb]);
        var conf = (await prompt('\n¿Confirma borrado? :> S/N ')).trim().toLowerCase();
        if (conf === 's') {
          agenda.borrar(idB);
          await agenda.guardar();
          console.log('Contacto borrado.');
        } else {
          console.log('Operación cancelada.');
        }
        await pausa();
      }
    } else if (op === '5') {
      console.log('== Buscar contacto ==');
      var q = await leerTexto('\nBuscar      :> ');
      var lr = agenda.buscar(q);
      if (lr.length === 0) console.log('(sin resultados)');
      else mostrarTabla(lr);
      await pausa();
    } else if (op === '0') {
      salir = true;
    } else {
      console.log('Opción inválida.');
      await pausa();
    }
  }
}

await main();
