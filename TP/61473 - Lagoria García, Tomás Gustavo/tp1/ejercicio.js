import {prompt, read, write} from './io.js';
async function main(){ const agenda = await Agenda.cargar();

  let salir = false;
  while (!salir) {
    console.clear();
    console.log("=== AGENDA DE CONTACTOS ===");
    console.log("1. Listar");
    console.log("2. Agregar");
    console.log("3. Editar");
    console.log("4. Borrar");
    console.log("5. Buscar");
    console.log("6. Finalizar");

    const opcion = await prompt("Ingresar opción :> ");
    console.clear();
    switch(opcion){
        case "1":
             console.log("== Lista de contactos ==\n");
            console.log("\nID      Nombre Completo     Edad       Teléfono         Email");
             for (let datos of agenda.listaContactos()) {
            console.log(datos);
            }
            await prompt("\nPresione una tecla para continuar...");
            break;
    
        case "2":
             console.log("== Agregando contacto ==\n");
        const nombre   = await prompt("Nombre      :> ");
        const apellido = await prompt("Apellido    :> ");
        const edad     = await prompt("Edad        :> ");
        const telefono = await prompt("Teléfono    :> ");
        const email    = await prompt("Email       :> ");
        const contacto = new Contacto(nombre,edad,apellido,telefono,email);
        agenda.agregar(contacto);
        await agenda.guardar();
        await prompt("\nContacto agregado. Presione una tecla para continuar...");        
            break;
        case "3":
           let R=parseInt(await prompt("ID de contacto a modificar:>"));
           let Cambiar=agenda.obtenerPorId(R);
              if(!Cambiar){console.log("No existe ese contacto.");
          await prompt("Enter para seguir...");
          break;}
            console.log(`Modificando contacto ID: ${R}`);
        Cambiar.nombre   = await prompt(`Nombre (${Cambiar.nombre}) :> `) || Cambiar.nombre;
        Cambiar.apellido = await prompt(`Apellido (${Cambiar.apellido}) :> `) || Cambiar.apellido;
        Cambiar.edad     = await prompt(`Edad (${Cambiar.edad}) :> `) || Cambiar.edad;
        Cambiar.telefono = await prompt(`Teléfono (${Cambiar.telefono}) :> `) || Cambiar.telefono;
        Cambiar.email    = await prompt(`Email (${Cambiar.email}) :> `) || Cambiar.email
            await agenda.guardar();
             console.log("Contacto modificado.");
        await prompt("Enter para seguir...");
        break;
        case "4":
            console.log("== Borrando contacto ==\n");
            let id = parseInt(await prompt("ID contacto :> "));
            let c = agenda.obtenerPorId(id);
            if(!c){
                console.log("No existe ese contacto.");
                await prompt("Enter para seguir...");
                break;
            }
            console.log(c.MostrarDatos()) ;
            let confirma = (await prompt("Confirma borrado? (s/n) :> ")).toLowerCase();
            if(confirma==="s"){
                agenda.Borrar(id);
                await agenda.guardar();
                console.log("Contacto borrado");
            }
            await prompt("Enter para seguir...");
            break;
        case "5":
             console.log("==Busqueda de contacto==\n");
            let text= await prompt("Buscar:> ");
            let res;
            try{
                res=agenda.BuscarContacto(text);
            } 
            catch(e){
                console.log(e.message);
                await prompt(" Presione cualquier tecla para seguir...");
                break;
            }
             
             console.log("\nID     Nombre Completo     Edad       Teléfono         Email");
             for( let c of res)
             {
                console.log(c.MostrarDatos());
             }
             await prompt("Enter para seguir...");
            break;

        case "6":
          console.log("Saliendo de la agenda");
             salir = true;
             break;
        default:
        console.log("Opción inválida");
        await prompt("Enter para seguir...");
        break;
    }
  }
    
}
class Contacto {
    #Nombre
    #Apellido
    #Telefono
    #_Edad
    #Email
    #ID
    constructor(nombre,edad,apellido,telefono,email,id=0){
        this.#_Edad=edad;
        this.#Nombre=nombre;
        this.#Apellido=apellido;
        this.#Telefono=telefono;
        this.#Email=email;
        this.#ID=id; 

    }
       NombreCompleto() {
        return ` ${this.#Apellido}, ${this.#Nombre}`;
    }
    get apellido(){
        return this.#Apellido;
    }
    get nombre(){
        return this.#Nombre;
    }
   get edad(){
    return this.#_Edad;
   }
    get telefono() {
        return this.#Telefono;
    }
    get email(){
        return this.#Email;
    }
    get ID(){
        return this.#ID;
    }


    set apellido(t){
         this.#Apellido=t;
    }
    set nombre(t){
         this.#Nombre=t;
    }
     set edad(t){
     this.#_Edad=t;
   }
    set telefono(t) {
         this.#Telefono=t;
    }
    set email(t){
         this.#Email=t;
    }
    set ID(t){
         this.#ID=t;
    }
    MostrarDatos(){
        return `${String(this.#ID).padEnd(5)}  ${this.NombreCompleto().padEnd(20)} ${String(this.#_Edad).padEnd(10)} ${this.#Telefono.padEnd(15)} ${this.#Email}`;
    }
    toJSON() {
    return {
      ID: this.#ID,
      Nombre: this.#Nombre,
      Apellido: this.#Apellido,
      Telefono: this.#Telefono,
      Edad: this.#_Edad,
      Email: this.#Email
    };
  }
}

class Agenda {
    #contactos
    #Proximo=1
    constructor() {
        this.#contactos = [];
    }
    agregar(contacto) {
        if( contacto.ID>0 ) {
            this.#contactos.push(contacto);
            return this; // ya tiene ID
            }
        this.#Proximo = Math.max(...this.#contactos.map(c=>c.ID)) +1;
        contacto.ID=this.#Proximo;
        this.#contactos.push(contacto);
        return this;
    }
    listaContactos() {
   return [...this.#contactos]
     .sort((a, b) => {
         if (a.apellido === b.apellido) 
             return a.nombre.localeCompare(b.nombre);
         return a.apellido.localeCompare(b.apellido);
     })
     .map(c => c.MostrarDatos());
}

    static async cargar(){ 
        try{

        let texto=await read();
        let datos=JSON.parse(texto);
        let agenda=new Agenda();
        for(let d of datos){
            let c=new Contacto(d.Nombre,Number(d.Edad),d.Apellido,d.Telefono,d.Email,Number(d.ID));
            agenda.agregar(c);
        }
        return agenda;
    }
        
        catch(e){
            return new Agenda();
        } 
    }
     
    async guardar(){let texto= JSON.stringify(this.#contactos.map(c=>c.toJSON()), null, 2);
        await write(texto);
    }
    BuscarContacto(txt)
    { let T=txt.toLowerCase();
        let  Cot= this.#contactos.filter(C=>C.nombre.toLowerCase().includes(T) || C.apellido.toLowerCase().includes(T) || C.telefono.toLowerCase().includes(T) || C.email.toLowerCase().includes(T) || C.ID==T);
        if(Cot.length==0){
            throw new Error(`No se encontró el contacto que contenga algo relacionado con ${txt}`);
    }
        return Cot;
    }
    Borrar(n){
        this.#contactos=this.#contactos.filter(C=>C.ID!==n);
    }

  obtenerPorId(id) {
    let cot= this.#contactos.find(c => c.ID === id);
    return cot;
  }
}
main();