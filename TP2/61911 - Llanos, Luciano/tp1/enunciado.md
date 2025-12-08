# TP1: Agenda de contactos

## Objetivo

Desarrollar una `Agenda de contactos` que se utilice desde la `consola` usando `orientación a objetos`.

## Estructura de datos

- La `Agenda` es una colección de contactos.
- Los `Contacto` contienen: `nombre`, `apellido`, `edad`, `teléfono` y `email`.

## Funcionalidad

El sistema debe:

1. Presentar un `menú` para elegir las operaciones a realizar.
2. Permitir `agregar`, `editar` y `borrar` un contacto.
3. Permitir `listar` los contactos ordenados alfabéticamente.
4. Permitir `buscar` por contenido.
5. Para `editar` o `borrar`, se debe utilizar un `ID` único.
6. `Guardar` y `Cargar` los datos en un archivo con formato JSON.
7. Los identificadores se deben construir con un número autoincremental.
8. Los contactos se deben mostrar ordenados por `apellido` y `nombre`.

### Ejemplo de ejecución del sistema

```bash
=== AGENDA DE CONTACTOS ===
1. Listar
2. Agregar
3. Editar
4. Borrar 
5. Buscar 
0. Finalizar

Ingresar opción :> 1

-----

== Lista de contactos ==
ID Nombre Completo       Edad        Teléfono        Email
02 Gómez, José             25        3815551235      jgomez@gmail.com
01 Pérez, Juan             30        3815551234      jperez@gmail.com
03 Sánchez, Pedro          18        3815551236      psanchez@gmail.com
...


Presione Enter para continuar...

-----

== Agregando contacto ==
Nombre      :> Alejandro
Apellido    :> Di Battista
Edad        :> 57
Teléfono    :> 3815343458
Email       :> alejandrodibattista@gmail.com

Presione Enter para continuar...

-----

== Buscar contacto ==

Buscar      :> pe

ID Nombre Completo       Edad        Teléfono        Email
01 Pérez, Juan             30        3815551234      jperez@gmail.com
03 Sánchez, Pedro          18        3815551236      psanchez@gmail.com

Presione Enter para continuar...

-----

== Borrar contacto ==

ID contacto :> 3

Borrando...
ID Nombre Completo       Edad        Teléfono        Email
03 Sánchez, Pedro          18        3815551236      psanchez@gmail.com

¿Confirma borrado? :> S/N
```

## Fecha de entrega

> [!IMPORTANT]
> El trabajo debe presentarse hasta el **30 de agosto a las 21:00**.

## Cómo presentar el trabajo

1. Clonar el repositorio.
 `(File | Clone Repository...)`

2. Crear una rama (TP1-{Legajo}).
 `(Branch | New branch...)`

3. Resolver el ejercicio (modificar los archivos en la carpeta TP/{Legajo...}/tp1, según corresponda).

4. Confirmar los cambios realizados.
 `(Commit)`

5. Publicar los cambios en GitHub.
 `(Repository | Push)`

6. Realizar la solicitud de incorporación (pull request) hacia la rama principal (main).
  `(Branch | Create pull request)`
 > NOTA: El pull request debe ser descrito como "TP1 - {Legajo} - {Nombre Apellido}".

7. Volver a la rama principal.
 `(Current branch | main)`

8. Actualizar los datos del repositorio local para mantenerlo sincronizado con los últimos cambios.
 `(Repository | Fetch)`
 `(Repository | Pull)`
