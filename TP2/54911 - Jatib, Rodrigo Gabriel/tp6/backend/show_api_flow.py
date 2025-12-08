from fastapi.testclient import TestClient
import json

# Import the ASGI app directly so we don't need uvicorn
from main import app
client = TestClient(app)

print('== API flow (in-process TestClient) ==')
# Try list products
r = client.get('/productos')
print('\nGET /productos ->', r.status_code)
try:
    data = r.json()
    if isinstance(data, list):
        print('First 3 products:')
        print(json.dumps(data[:3], ensure_ascii=False, indent=2))
    else:
        print('Response:', data)
except Exception as e:
    print('Could not parse productos response:', e)

# Register a user
reg_payload = {'email': 'tester@example.com', 'password': 'secret123'}
r = client.post('/registrar', json=reg_payload)
print('\nPOST /registrar ->', r.status_code, r.text)

# Login (compat route may expect form data for OAuth2; try form then JSON)
login_data = {'username': 'tester@example.com', 'password': 'secret123'}
r = client.post('/iniciar-sesion', data=login_data)
print('\nPOST /iniciar-sesion (form) ->', r.status_code, r.text)
if r.status_code == 200:
    try:
        token = r.json().get('access_token') or r.json().get('token') or r.json().get('accessToken')
        print('Token:', token)
    except Exception:
        print('Could not parse token JSON')
else:
    print('Login form failed, trying JSON...')
    r = client.post('/iniciar-sesion', json={'email': 'tester@example.com', 'password': 'secret123'})
    print('POST /iniciar-sesion (json) ->', r.status_code, r.text)

# Try to get cart (should be empty or error if auth required)
r = client.get('/carrito')
print('\nGET /carrito ->', r.status_code, r.text)

print('\n== End of in-process API check ==')
