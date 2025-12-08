import os
import requests
import sys
import time
from datetime import datetime

# Allow overriding the API base via E2E_API env var; default to 8000 which is where the backend runs in dev
API = os.getenv('E2E_API', 'http://localhost:8000')

ts = datetime.utcnow().strftime('%Y%m%d%H%M%S')
email = f'e2e.user.{ts}@example.com'
password = 'P@ssw0rd123!'
nombre = 'E2E User'

headers = {'Content-Type': 'application/json'}

print('API:', API)
print('Registering user:', email)
try:
    r = requests.post(f'{API}/registrar', json={'nombre': nombre, 'email': email, 'password': password}, headers=headers, timeout=10)
    r.raise_for_status()
    reg = r.json()
    print('Register response:', reg)
except Exception as e:
    print('Register failed:', e)
    if hasattr(e, 'response') and e.response is not None:
        try:
            print(e.response.text)
        except Exception:
            pass
    sys.exit(1)

token = reg.get('access_token')
if not token:
    print('No token returned after register')
    sys.exit(1)

auth_headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

print('\nAdding product 1 (cantidad 2) to cart...')
try:
    r = requests.post(f'{API}/carrito', json={'producto_id': 1, 'cantidad': 2}, headers=auth_headers, timeout=10)
    r.raise_for_status()
    add = r.json()
    print('Add to cart response:', add)
except Exception as e:
    print('Add to cart failed:', e)
    if hasattr(e, 'response') and e.response is not None:
        print('Response:', e.response.text)
    sys.exit(1)

print('\nFetching cart...')
try:
    r = requests.get(f'{API}/carrito', headers=auth_headers, timeout=10)
    r.raise_for_status()
    cart = r.json()
    print('Cart:', cart)
except Exception as e:
    print('View cart failed:', e)
    if hasattr(e, 'response') and e.response is not None:
        print('Response:', e.response.text)
    sys.exit(1)

print('\nFinalizing purchase...')
try:
    payload = {'direccion': 'Calle Falsa 123', 'tarjeta': '4111111111111111'}
    r = requests.post(f'{API}/carrito/finalizar', json=payload, headers=auth_headers, timeout=10)
    r.raise_for_status()
    final = r.json()
    print('Finalize response:', final)
except Exception as e:
    print('Finalize failed:', e)
    if hasattr(e, 'response') and e.response is not None:
        print('Response:', e.response.text)
    sys.exit(1)

print('\nE2E completed. Purchase ID:', final.get('purchase_id'), 'Total:', final.get('total'))
