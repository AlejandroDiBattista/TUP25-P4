import json

with open('productos.json', encoding='utf-8') as f:
    data = json.load(f)

print(f'Total productos: {len(data)}')
print('\nPrimeros 3:')
for p in data[:3]:
    print(f'ID {p["id"]}: {p["titulo"]} - Stock: {p.get("existencia", "NO DEFINIDO")} - Precio: ${p["precio"]}')
