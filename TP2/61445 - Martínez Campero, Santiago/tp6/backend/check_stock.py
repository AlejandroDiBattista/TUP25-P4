import sqlite3

conn = sqlite3.connect('database.db')
cursor = conn.cursor()
cursor.execute('SELECT id, nombre, existencia FROM producto ORDER BY id')
rows = cursor.fetchall()

print('\n=== STOCK DE PRODUCTOS ===\n')
for r in rows:
    estado = '🔴 AGOTADO' if r[2] == 0 else f'✅ {r[2]:2d} unidades'
    print(f'ID {r[0]:2d}: {estado:20s} | {r[1][:50]}')

conn.close()
