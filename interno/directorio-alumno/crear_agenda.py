import re
from box import Box


def leer_todos(archivo):
    with open(archivo, 'r', encoding='utf-8') as f:
        alumnos = Box({})
        curso = None
        estado = None

        for linea in f:
            linea = linea.strip()
            if not linea or linea.startswith('# '): continue
            if linea.startswith('## '):
                curso = linea[3:].strip()
                estado = None
            elif linea.startswith('### '):
                estado = linea[4:].strip()
            elif "-" in linea:
                legajo, nombre = map(str.strip, linea.split('-'))
                if curso not in alumnos:
                    if legajo not in alumnos:
                        alumnos[legajo] = Box({'legajo': legajo, 'nombre': nombre, 'cursos': []})
                    try:
                        _, año, materia, comision = curso.split('-')
                        alumnos[legajo]["cursos"].append({"año": 2000+int(año.strip()), "materia": materia.strip(), "comision": comision.strip(), "estado": estado})
                    except ValueError:
                        print(f"{curso=}")
        
        return alumnos

def leer_cursando(origen: str = "../../alumnos.md") -> list:
    """
    Lee un archivo markdown con datos de alumnos y devuelve una lista de diccionarios.
    """

    print(f"> Leyendo {origen}...")
    salida, comision = [], ""
    with open(origen, "r", encoding='utf-8') as archivo:
        for linea in archivo:
            if not linea.strip():
                continue

            # Normalizar espacios iniciales para aceptar tanto '- ...' como ' - ...'
            sline = linea.lstrip()

            if sline.startswith("##"):
                # Tomar último caracter numérico de la cabecera (p. ej. '## Comisión 1')
                comision = "C" + sline.strip("# \n")[-1]

            if sline.startswith("- "):
                sline = sline.replace("@","")
                partes = re.split(r"\s{2,}", sline.strip("- \n@"))
                if len(partes) < 5:
                    partes.append("")
                legajo, nombre, telefono, practicos, github = partes
                valores = [legajo, nombre, telefono, github, comision]
                valores = dict(zip('legajo nombre telefono github comision'.split(), valores))

                for i, p in enumerate(practicos, 1):
                    if p == "0":  p = "🔴"
                    if p == "⚪️": p = "🔴"
                    if p == "1":  p = "🟢"
                    valores[f"TP{i}"] = p

                salida.append(valores)
    print(f"| {len(salida)} alumnos leídos.")
    return sorted(salida, key=lambda x: [x['comision'], x['legajo']])


def agregar_telefono_github(archivo, alumnos):
    telefonos = {}
    with open(archivo, 'r', encoding='utf-8') as f:
        for linea in f:
            if not linea.strip() or linea.startswith("#"): continue
            linea += '  '  # Asegura al menos dos espacios al final
            parts = re.split(r'\s{2,}', linea.strip())
            parts += [''] * (4 - len(parts))
            legajo, nombre, telefono, github = [p.strip() for p in parts[:4]]
            if legajo in alumnos:
                alumnos[legajo]['telefono'] = telefono
                alumnos[legajo]['github'] = github

    return telefonos


def listar_alumnos(alumnos, minimo=1):
    students_iterable = alumnos.values() if isinstance(alumnos, dict) else alumnos

    resultado = []
    for alumno in students_iterable:
        cursos = alumno.get('cursos', []) if isinstance(alumno, dict) else []
        if len(cursos) >= minimo:
            resultado.append(alumno)

    if not resultado:
        print(f"No hay alumnos que hayan estado al menos en {minimo} cursos.")
    else:
        for a in resultado:
            print(f"{a.get('legajo','?')} - {a.get('nombre','?')} ({len(a.get('cursos',[]))} cursos)")
            for c in a.get('cursos', []):
                print(f"  {c.get('año','')} - {c.get('materia','')} - {c.get('comision','')} - estado: {c.get('estado')}")
            print()

def generar_agenda(alumnos, archivo="agenda.vcf"):
    with open(archivo, 'w', encoding='utf-8') as f:
        for alumno in alumnos.values() if isinstance(alumnos, dict) else alumnos:
            vcard = generar_vcard(alumno)
            f.write(vcard + "\n")
    
def generar_vcard(alumno):
    nombre_completo = alumno.get('nombre', 'Desconocido')
    apellidos, nombres = nombre_completo.split(',', 1)
    telefono = alumno.get('telefono', '')
    github = alumno.get('github', '')
    legajo = alumno.get('legajo', '00000')
    cursos = alumno.get('cursos', [])
    texto = [ f"Año: {c['año']} Materia: {c['materia']} Comisión {c['comision']} Estado: {c['estado']}" for c in cursos ]

    vcard = [
                "BEGIN:VCARD",
                "VERSION:3.0",
                f"FN:{nombre_completo}",        # Nombre completo para mostrar
                f"N:{apellidos};{nombres};;;",  # Apellido;Nombre;SegundoNombre;Prefijo;Sufijo
                f"TEL;TYPE=CELL:{telefono}",    # Teléfono celular
                f"NOTE:Legajo: {legajo} - Github: {github}",  # Nota con legajo y comisión
                f"{' | '.join(texto)}",    # Nota con cursos
                "END:VCARD"
            ]
    
    return "\n".join(vcard)

def agregar_practicos(cursando, alumnos):
    for alumno in cursando:
        legajo = alumno['legajo']
        if legajo in alumnos:
            original = alumnos[legajo]
            for curso in original.get('cursos', []):
                if curso['estado'] == 'Cursando':
                    for key, value in alumno.items():
                        if key.startswith('TP'):
                            curso[key] = value

def normalizar_materias(alumnos):
    for alumno in alumnos.values():
        for curso in alumno.get('cursos', []):
            materia = curso.get('materia', '').strip().lower()
            if materia in ['lab3', 'lab4']:
                curso['materia'] = materia.replace('lab', 'Laboratorio ')
            elif materia in ['pro3', 'pro4']:
                curso['materia'] = materia.replace('pro', 'Programación ')
            curso["codigo"] = f"{materia[0]}{materia[-1]}".upper()


alumnos = leer_todos('./alumnos-totales.md')
agregar_telefono_github('telefonos.md', alumnos)
agregar_practicos(leer_cursando(), alumnos)
normalizar_materias(alumnos)
listar_alumnos(alumnos, minimo=2)

with open("alumnos.vcf", "w", encoding="utf-8") as f:
    generar_agenda(alumnos, archivo=f.name)

with open("./deploy/alumnos.json", "w", encoding="utf-8") as f:
    f.write(alumnos.to_json(indent=4))