# inspect_compras.py - simple inspector for compras and itemcompra
import sqlite3, json, os
from pathlib import Path

DB = Path(__file__).resolve().parents[0] / 'database.db'
# fallback hardcoded path
DB = r"D:\UTN\Programacion\2do\2doCuatri\TP1\tup25-p4\tp\61035 - Ledesma, Paulo Marcelo\tp6\backend\database.db"
if not os.path.exists(DB):
    print('DB not found:', DB)
    raise SystemExit(1)
con = sqlite3.connect(str(DB))
cur = con.cursor()
compras = cur.execute("SELECT id, fecha, total, direccion, tarjeta, envio FROM compra ORDER BY id DESC").fetchall()
out = []
for c in compras:
    cid = c[0]
    items = cur.execute("SELECT id, compra_id, nombre, cantidad, precio_unitario FROM itemcompra WHERE compra_id=?", (cid,)).fetchall()
    out.append({
        'compra': {'id':cid, 'fecha': c[1], 'total': c[2], 'direccion': c[3], 'tarjeta': c[4], 'envio': c[5]},
        'items': [{'id':i[0], 'compra_id':i[1], 'nombre':i[2], 'cantidad':i[3], 'precio_unitario':i[4]} for i in items]
    })
print(json.dumps(out, indent=2, default=str))
con.close()
