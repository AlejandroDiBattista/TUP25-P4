import json
import sqlite3
from pathlib import Path

DB = Path(__file__).parent / "tp6.db"
PRODUCTOS_JSON = Path(__file__).parent / "productos.json"

if not DB.exists():
    print("Database file not found:", DB)
    raise SystemExit(1)

if not PRODUCTOS_JSON.exists():
    print("productos.json not found:", PRODUCTOS_JSON)
    raise SystemExit(1)

data = json.loads(PRODUCTOS_JSON.read_text(encoding="utf-8"))

conn = sqlite3.connect(str(DB))
cur = conn.cursor()
updated = 0
for item in data:
    pid = item.get("id")
    img = item.get("imagen", "")
    if pid is None:
        continue
    cur.execute("SELECT imagen FROM producto WHERE id = ?", (pid,))
    row = cur.fetchone()
    if row is None:
        # no existe fila con ese id
        continue
    current = row[0] if row else None
    if not current and img:
        cur.execute("UPDATE producto SET imagen = ? WHERE id = ?", (img, pid))
        updated += 1

conn.commit()
conn.close()

print(f"Updated {updated} products with imagen values")