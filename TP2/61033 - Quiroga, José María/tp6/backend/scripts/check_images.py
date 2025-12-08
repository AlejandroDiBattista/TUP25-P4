import sqlite3
import sqlite3
import os

DB = 'ecommerce.db'
IMAGES_DIR = os.path.join(os.path.dirname(__file__), '..', 'imagenes')
IMAGES_DIR = os.path.normpath(os.path.abspath(IMAGES_DIR))

con = sqlite3.connect(os.path.join(os.path.dirname(__file__), '..', DB))
cur = con.cursor()

# Try table name guesses
candidates = ['producto', 'productos', 'Producto', 'Productos']
found = None
for name in candidates:
    try:
        cur.execute(f"SELECT COUNT(*) FROM {name}")
        found = name
        break
    except Exception:
        continue

if not found:
    print('No se encontró tabla de productos con nombres esperados.')
    con.close()
    exit(1)

print('Usando tabla:', found)
cur.execute(f"PRAGMA table_info({found})")
cols = [r[1] for r in cur.fetchall()]
print('Columnas:', cols)

# Query rows and check imagen field if present
if 'imagen' in cols:
    cur.execute(f"SELECT id, nombre, imagen FROM {found}")
    rows = cur.fetchall()
    missing_imagen_rows = []
    missing_files = []
    for r in rows:
        pid, nombre, imagen = r
        imagen_str = imagen if imagen is not None else ''
        if imagen_str.strip() == '' or imagen_str.strip().lower() in ('undefined', 'null'):
            missing_imagen_rows.append((pid, nombre, imagen))
        else:
            # normalize path
            img_path = os.path.join(os.path.dirname(__file__), '..', imagen_str)
            img_path = os.path.normpath(os.path.abspath(img_path))
            if not os.path.isfile(img_path):
                missing_files.append((pid, nombre, imagen_str, img_path))

    print('Total productos:', len(rows))
    print('Productos con imagen vacía/undefined/null:', len(missing_imagen_rows))
    for x in missing_imagen_rows[:20]:
        print(' -', x)
    print('Productos con imagen referenciada pero archivo ausente:', len(missing_files))
    for x in missing_files[:50]:
        print(' -', x)
else:
    print('La tabla no tiene columna `imagen`.')

con.close()