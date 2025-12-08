#!/usr/bin/env python3
"""
Reset product stock in SQLite DB from a productos.json file found in the repo.
Usage: python scripts/reset_stock.py

The script will:
- search for a productos.json in the repo (prefer backend tp6/productos.json)
- search for a database.db in the repo (prefer backend tp6/database.db)
- update producto.existencia by id using values from the JSON
"""
from pathlib import Path
import sqlite3
import json
import sys

repo_root = Path(__file__).resolve().parents[2]
print("Repo root:", repo_root)

# Find productos.json (prefer paths that contain 'tp6')
productos_candidates = list(repo_root.rglob('productos.json'))
productos_path = None
for p in productos_candidates:
    if 'tp6' in str(p).lower():
        productos_path = p
        break
if not productos_path and productos_candidates:
    productos_path = productos_candidates[0]

if not productos_path:
    print("No se encontró 'productos.json' en el repo. Busqué en:", repo_root)
    sys.exit(1)

print("Usando productos.json:", productos_path)

# Find database.db (prefer paths that contain 'tp6')
db_candidates = list(repo_root.rglob('database.db'))
db_path = None
for p in db_candidates:
    if 'tp6' in str(p).lower():
        db_path = p
        break
if not db_path and db_candidates:
    db_path = db_candidates[0]

if not db_path:
    print("No se encontró 'database.db' en el repo. Busqué en:", repo_root)
    sys.exit(1)

print("Usando database.db:", db_path)

# Load productos
with productos_path.open(encoding='utf-8') as f:
    productos = json.load(f)

# Connect to sqlite and update existencia
con = sqlite3.connect(str(db_path))
cur = con.cursor()
updated = 0
missing = []
for p in productos:
    pid = p.get('id')
    existencia = p.get('existencia', 0)
    if pid is None:
        continue
    # Use parameterized query
    cur.execute('UPDATE producto SET existencia = ? WHERE id = ?', (int(existencia), int(pid)))
    if cur.rowcount > 0:
        updated += 1
    else:
        missing.append(pid)

con.commit()
con.close()

print(f"Actualizados: {updated}")
if missing:
    print("IDs no encontrados en la tabla producto:", missing)
print("Hecho. Si todo fue correcto, el stock fue restaurado según el JSON.")
