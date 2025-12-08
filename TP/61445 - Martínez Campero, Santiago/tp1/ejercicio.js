import {prompt, read, write} from './io.js';

class Contacto {
    #id
    #nombre
    #apellido
    #edad
    #telefono
    #email
    constructor({ id, nombre, apellido, edad, telefono, email }) {
        this.#id = id;
        this.#nombre = nombre ?? '';
        this.#apellido = apellido ?? '';
        this.#edad = edad ?? null;
        this.#telefono = telefono ?? '';
        this.#email = email ?? '';
    }
    get id(){ return this.#id }
    get nombre(){ return this.#nombre }
    get apellido(){ return this.#apellido }
    get edad(){ return this.#edad }
    get telefono(){ return this.#telefono }
    get email(){ return this.#email }

    get nombreCompleto(){
        const apellido = (this.#apellido || '').trim()
        const nombre = (this.#nombre || '').trim()
        if (apellido && nombre) return `${apellido}, ${nombre}`
        if (apellido) return apellido
        if (nombre) return nombre
        return ''
    }

    toJSON(){
        return {
            id: this.#id,
            nombre: this.#nombre,
            apellido: this.#apellido,
            edad: this.#edad,
            telefono: this.#telefono,
            email: this.#email
        }
    }

    static from(obj){
        return new Contacto({
            id: obj.id,
            nombre: obj.nombre,
            apellido: obj.apellido,
            edad: obj.edad,
            telefono: obj.telefono,
            email: obj.email,
        })
    }
}

class Agenda {
    #contactos = []
    #proximoId = 1

    constructor(contactos = []){
        this.#contactos = []
        for (const item of contactos) {
            const c = Contacto.from(item)
            this.#contactos.push(c)
        }
        let maximoId = 0
        for (const c of this.#contactos) {
            if (typeof c.id === 'number' && c.id > maximoId) maximoId = c.id
        }
        this.#proximoId = maximoId + 1
    }

    static fromJson(json){
        // Acepta: array, objeto con array, o string JSON
        if (!json) return new Agenda([])
        try {
            const data = (typeof json === 'string') ? JSON.parse(json) : json
            const lista = Array.isArray(data) ? data : (Array.isArray(data?.contactos) ? data.contactos : [])
            return new Agenda(lista)
        } catch {
            // Si viene corrupto, devolvemos agenda vacía para no romper el flujo
            return new Agenda([])
        }
    }

    toJson(){
        // Devuelve un array de objetos plain listo para persistir
        return this.#contactos.map(c => c.toJSON())
        // Si tu write() necesita string, usá:
        // return JSON.stringify(this.#contactos.map(c => c.toJSON()), null, 2)
    }

    agregar({nombre, apellido='', edad=null, telefono='', email=''}){
        const contacto = new Contacto({ id: this.#proximoId++, nombre, apellido, edad, telefono, email })
        this.#contactos.push(contacto)
        return contacto
    }

    listarOrdenado(){
        return [...this.#contactos].sort((a,b)=>
            a.nombreCompleto.localeCompare(b.nombreCompleto, 'es', { sensitivity: 'base' })
        )
    }

    buscar(texto){
        const q = (texto || '').toLowerCase().trim()
        const resultados = []
        for (const c of this.#contactos) {
            const valores = [
                c.nombre,
                c.apellido,
                c.edad == null ? '' : String(c.edad),
                c.telefono,
                c.email
            ]
            const coincide = valores.some(v => String(v || '').toLowerCase().includes(q))
            if (coincide) resultados.push(c)
        }
        return resultados.sort((a,b)=>
            a.nombreCompleto.localeCompare(b.nombreCompleto, 'es', { sensitivity: 'base' })
        )
    }

    obtenerPorId(id){
        const buscado = +id
        for (let i = 0; i < this.#contactos.length; i++) {
            const c = this.#contactos[i]
            if (c.id === buscado) return c
        }
        return null
    }

    borrarPorId(id){
        const buscado = +id
        for (let i = 0; i < this.#contactos.length; i++) {
            const c = this.#contactos[i]
            if (c.id === buscado) {
                const eliminado = c
                this.#contactos.splice(i, 1)
                return eliminado
            }
        }
        return null
    }

    editar(id, campos){
        const c = this.obtenerPorId(id)
        if(!c) return null
        const actualizado = new Contacto({
            id: c.id,
            nombre: campos.nombre ?? c.nombre,
            apellido: campos.apellido ?? c.apellido,
            edad: (campos.edad !== undefined) ? (Number.isFinite(+campos.edad) ? +campos.edad : c.edad) : c.edad,
            telefono: campos.telefono ?? c.telefono,
            email: campos.email ?? c.email,
        })
        const i = this.#contactos.findIndex(x=>x.id===c.id)
        this.#contactos[i] = actualizado
        return actualizado
    }
}

function imprimirTabla(contactos){
    const encabezado = 'ID Nombre completo               Edad  Teléfono       Email'
    console.log(encabezado)
    for(const c of contactos){
        const id = String(c.id).padStart(2,'0')
        const nom = c.nombreCompleto.padEnd(28,' ')
        const edad = String(c.edad ?? '-').padStart(4,' ')
        const tel = String(c.telefono ?? '').padEnd(13,' ')
        const mail = String(c.email ?? '')
        console.log(`${id} ${nom} ${edad}  ${tel} ${mail}`)
    }
}

async function pausar(){ await prompt("\nPresione Enter para continuar... ") }

async function vacio(etiqueta){
    while(true){
        const v = await prompt(etiqueta)
        if ((v || '').trim() !== '') return v
        console.log("El nombre es obligatorio.")
    }
}

async function getEdadOpcional(){
    while(true){
        const e = await prompt("Edad        :> ")
        const t = e.trim()
        if (t === '') return null
        const n = +t
        if (!Number.isNaN(n) && n >= 0) return n
        console.log("Edad inválida. Ingrese un número o deje vacío.")
    }
}

async function getTexto(etiqueta, actual){
    const v = await prompt(`${etiqueta} (${actual})      :> `)
    return v ? v : undefined
}

async function getEdadQuizas(actual){
    const v = await prompt(`Edad (${actual == null ? '-' : actual})        :> `)
    if (!v) return undefined
    const n = +v
    if (!Number.isNaN(n) && n >= 0) return n
    console.log("Edad inválida, se mantiene la actual.")
    return undefined
}

async function confirmarSN(mensaje){
    const r = await prompt(`${mensaje}`)
    return (r || '').trim().toLowerCase() === 's'
}

function mostrarTablaOSinDatos(lista, mensajeVacio, etiquetaCantidad){
    if (lista.length === 0) {
        console.log(mensajeVacio)
    } else {
        imprimirTabla(lista)
        if (etiquetaCantidad) console.log(`\n${etiquetaCantidad}: ${lista.length}`)
    }
}

async function obtenerContactoPorIdInteractivo(agenda){
    const id = await prompt("ID contacto :> ")
    const n = +id
    if (!Number.isFinite(n) || n <= 0) { console.log("ID inválido"); await pausar(); return null }
    const c = agenda.obtenerPorId(n)
    if (!c) { console.log("No existe ese ID"); await pausar(); return null }
    return c
}

async function getCamposEdicion(c){
    const nombre = await getTexto('Nombre', c.nombre)
    const apellido = await getTexto('Apellido', c.apellido)
    const edad = await getEdadQuizas(c.edad)
    const telefono = await getTexto('Teléfono', c.telefono)
    const email = await getTexto('Email', c.email)
    const campos = {}
    if (nombre !== undefined) campos.nombre = nombre
    if (apellido !== undefined) campos.apellido = apellido
    if (edad !== undefined) campos.edad = edad
    if (telefono !== undefined) campos.telefono = telefono
    if (email !== undefined) campos.email = email
    return Object.keys(campos).length ? campos : null
}

async function opcionListar(agenda){
    console.log("== Lista de contactos ==")
    const lista = agenda.listarOrdenado()
    mostrarTablaOSinDatos(lista, "No hay contactos para mostrar.", "Total")
    await pausar()
}

async function opcionAgregar(agenda){
    console.log("== Agregando contacto ==")
    const nombre = await vacio("Nombre      :> ")
    const apellido = await prompt("Apellido    :> ")
    const edad = await getEdadOpcional()
    const telefono = await prompt("Teléfono    :> ")
    const email = await prompt("Email       :> ")
    const nuevo = agenda.agregar({ nombre, apellido, edad, telefono, email })
    await write(agenda.toJson(), './agenda.json')
    console.log("\nAgregado:")
    imprimirTabla([nuevo])
    await pausar()
}

async function opcionEditar(agenda){
    console.log("== Editar contacto ==")
    const c = await obtenerContactoPorIdInteractivo(agenda)
    if (!c) return
    const campos = await getCamposEdicion(c)
    if (!campos) { console.log("Sin cambios."); await pausar(); return }
    const actualizado = agenda.editar(c.id, campos)
    await write(agenda.toJson(), './agenda.json')
    console.log("\nActualizado:")
    imprimirTabla([actualizado])
    await pausar()
}

async function opcionBorrar(agenda){
    console.log("== Borrar contacto ==")
    const c = await obtenerContactoPorIdInteractivo(agenda)
    if (!c) return
    console.log("\nBorrando...")
    imprimirTabla([c])
    const ok = await confirmarSN("\n¿Confirma borrado? :> S/N ")
    if (ok) {
        agenda.borrarPorId(c.id)
        await write(agenda.toJson(), './agenda.json')
        console.log("\nEliminado.")
    } else {
        console.log("\nCancelado.")
    }
    await pausar()
}

async function opcionBuscar(agenda){
    console.log("== Buscar contacto ==")
    const q = await prompt("Buscar      :> ")
    const res = agenda.buscar(q)
    mostrarTablaOSinDatos(res, "Sin resultados.", "Resultados")
    await pausar()
}

async function menu(agenda){
    while(true){
        console.log("\n=== AGENDA DE CONTACTOS ===")
        console.log("1. Listar")
        console.log("2. Agregar")
        console.log("3. Editar")
        console.log("4. Borrar")
        console.log("5. Buscar")
        console.log("0. Salir")
        const opcion = await prompt("\nIngresar opción :> ")
        console.log("\n-----\n")
        switch (opcion) {
            case '0': return
            case '1': await opcionListar(agenda); break
            case '2': await opcionAgregar(agenda); break
            case '3': await opcionEditar(agenda); break
            case '4': await opcionBorrar(agenda); break
            case '5': await opcionBuscar(agenda); break
            default: console.log("Opción no válida")
        }
    }
}

let agenda = Agenda.fromJson(await read('./agenda.json'));
await menu(agenda)