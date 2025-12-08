import sys
from main import app
from database import create_db_and_tables
from fastapi.testclient import TestClient

create_db_and_tables()
client = TestClient(app)

try:
    # Registrar usuario
    r = client.post('/auth/registrar', json={'nombre': 'User', 'email': 'user@test.com', 'password': 'password123'})
    if r.status_code != 200:
        print(f"✗ Registrar falló: {r.status_code}")
        sys.exit(1)
    print('✓ Registrar - 200')

    # Login
    r = client.post('/auth/iniciar-sesion', json={'email': 'user@test.com', 'password': 'password123'})
    if r.status_code != 200:
        print(f"✗ Login falló: {r.status_code}")
        sys.exit(1)
    
    token = r.json()['access_token']
    print('✓ Login - 200')

    # Agregar al carrito
    headers = {'Authorization': f'Bearer {token}'}
    r = client.post('/carrito?producto_id=1&cantidad=2', headers=headers)
    if r.status_code != 200:
        print(f"✗ Agregar al carrito falló: {r.status_code}")
        print(r.text)
        sys.exit(1)
    print('✓ Agregar al carrito - 200')

    # Ver carrito
    r = client.get('/carrito', headers=headers)
    if r.status_code != 200:
        print(f"✗ Ver carrito falló: {r.status_code}")
        sys.exit(1)
    
    items_count = len(r.json()['items'])
    print(f'✓ Ver carrito - 200 ({items_count} items)')

    # Quitar del carrito
    r = client.delete('/carrito/1', headers=headers)
    if r.status_code != 200:
        print(f"✗ Quitar del carrito falló: {r.status_code}")
        sys.exit(1)
    print('✓ Quitar del carrito - 200')

    print('\n✓✓✓ Todos los endpoints de carrito funcionan correctamente')

except Exception as e:
    print(f"✗ Error: {e}")
    sys.exit(1)
