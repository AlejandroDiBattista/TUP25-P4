from fastapi.testclient import TestClient
from datetime import datetime
import sys

from main import app

client = TestClient(app)

API = 'local'

ts = datetime.utcnow().strftime('%Y%m%d%H%M%S')
email = f'e2e.user.{ts}@example.com'
password = 'P@ssw0rd123!'
nombre = 'E2E User'

print('Running local E2E using TestClient')
print('Registering user:', email)

r = client.post('/registrar', json={'nombre': nombre, 'email': email, 'password': password})
if r.status_code >= 400:
    print('Register failed:', r.status_code, r.text)
    sys.exit(1)
reg = r.json()
print('Register response:', reg)

token = reg.get('access_token')
if not token:
    print('No token returned after register')
    sys.exit(1)

auth_headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

print('\nAdding product 1 (cantidad 2) to cart...')
r = client.post('/carrito', json={'producto_id': 1, 'cantidad': 2}, headers=auth_headers)
if r.status_code >= 400:
    print('Add to cart failed:', r.status_code, r.text)
    sys.exit(1)
print('Add to cart response:', r.json())

print('\nFetching cart...')
r = client.get('/carrito', headers=auth_headers)
if r.status_code >= 400:
    print('View cart failed:', r.status_code, r.text)
    sys.exit(1)
print('Cart:', r.json())

print('\nFinalizing purchase...')
payload = {'direccion': 'Calle Falsa 123', 'tarjeta': '4111111111111111'}
r = client.post('/carrito/finalizar', json=payload, headers=auth_headers)
if r.status_code >= 400:
    print('Finalize failed:', r.status_code, r.text)
    sys.exit(1)
final = r.json()
print('Finalize response:', final)

print('\nE2E completed. Purchase ID:', final.get('purchase_id'), 'Total:', final.get('total'))
