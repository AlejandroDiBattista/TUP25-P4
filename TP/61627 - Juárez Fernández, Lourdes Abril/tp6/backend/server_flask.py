"""Backend simplificado usando Flask para evitar problemas de compatibilidad"""

import sqlite3
import json
import hashlib
import time
import base64
from pathlib import Path
from typing import Optional
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DB_PATH = "tp6.db"
SECRET = "dev-secret-please-change"
TOKEN_EXP_SECONDS = 60 * 60 * 24

def get_db():
    """Obtiene conexión a la base de datos"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Inicializa la base de datos con las tablas necesarias"""
    conn = get_db()
    
    conn.execute('''
        CREATE TABLE IF NOT EXISTS producto (
            id INTEGER PRIMARY KEY,
            nombre TEXT NOT NULL,
            descripcion TEXT DEFAULT '',
            precio REAL DEFAULT 0.0,
            categoria TEXT DEFAULT '',
            existencia INTEGER DEFAULT 0,
            imagen TEXT DEFAULT ''
        )
    ''')
    
    conn.execute('''
        CREATE TABLE IF NOT EXISTS usuario (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL
        )
    ''')
    
    conn.execute('''
        CREATE TABLE IF NOT EXISTS carrito (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            estado TEXT DEFAULT 'abierto',
            FOREIGN KEY (usuario_id) REFERENCES usuario (id)
        )
    ''')
    
    conn.execute('''
        CREATE TABLE IF NOT EXISTS itemcarrito (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            carrito_id INTEGER NOT NULL,
            producto_id INTEGER NOT NULL,
            cantidad INTEGER DEFAULT 1,
            FOREIGN KEY (carrito_id) REFERENCES carrito (id),
            FOREIGN KEY (producto_id) REFERENCES producto (id)
        )
    ''')
    
    conn.execute('''
        CREATE TABLE IF NOT EXISTS compra (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            fecha REAL NOT NULL,
            direccion TEXT,
            tarjeta TEXT,
            total REAL DEFAULT 0.0,
            envio REAL DEFAULT 0.0,
            FOREIGN KEY (usuario_id) REFERENCES usuario (id)
        )
    ''')
    
    conn.execute('''
        CREATE TABLE IF NOT EXISTS itemcompra (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            compra_id INTEGER NOT NULL,
            producto_id INTEGER NOT NULL,
            cantidad INTEGER NOT NULL,
            nombre TEXT NOT NULL,
            precio_unitario REAL NOT NULL,
            FOREIGN KEY (compra_id) REFERENCES compra (id)
        )
    ''')
    
    conn.execute('''
        CREATE TABLE IF NOT EXISTS sesion (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            token TEXT NOT NULL,
            expires_at INTEGER NOT NULL,
            FOREIGN KEY (usuario_id) REFERENCES usuario (id)
        )
    ''')
    
    conn.commit()
    
    cursor = conn.execute('SELECT COUNT(*) FROM producto')
    if cursor.fetchone()[0] == 0:
        load_products(conn)
    
    conn.close()

def load_products(conn):
    """Carga productos desde el archivo JSON"""
    productos_json = Path(__file__).parent / "productos.json"
    if not productos_json.exists():
        return
    
    with open(productos_json, 'r', encoding='utf-8') as f:
        products_data = json.load(f)
    
    for product in products_data:
        imagen = product.get("imagen", "")
        if "/" in imagen:
            imagen = imagen.split("/")[-1]
        
        conn.execute('''
            INSERT INTO producto (id, nombre, descripcion, precio, categoria, existencia, imagen)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            product.get("id"),
            product.get("titulo") or product.get("nombre", ""),
            product.get("descripcion", ""),
            float(product.get("precio", 0)),
            product.get("categoria", ""),
            int(product.get("existencia", 5)),
            imagen
        ))
    
    conn.commit()

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed_password: str) -> bool:
    return hash_password(password) == hashed_password

def create_token(email: str) -> str:
    timestamp = int(time.time())
    data = f"{email}:{timestamp}:{SECRET}"
    token = base64.b64encode(data.encode()).decode()
    return token

def verify_token(token: str) -> Optional[str]:
    try:
        data = base64.b64decode(token).decode()
        email, timestamp, secret = data.split(":", 2)
        if secret != SECRET:
            return None
        if int(timestamp) + TOKEN_EXP_SECONDS < time.time():
            return None
        return email
    except:
        return None

def get_current_user():
    """Middleware para obtener usuario actual desde el token"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header[7:]
    email = verify_token(token)
    if not email:
        return None
    
    conn = get_db()
    cursor = conn.execute('SELECT * FROM usuario WHERE email = ?', (email,))
    user = cursor.fetchone()
    conn.close()
    
    return dict(user) if user else None

@app.route('/')
def root():
    return jsonify({"message": "TP6 E-commerce API funcionando correctamente"})

@app.route('/productos')
def get_productos():
    conn = get_db()
    cursor = conn.execute('SELECT * FROM producto')
    productos = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(productos)

@app.route('/registrar', methods=['POST'])
def registrar():
    data = request.get_json()
    nombre = data.get('nombre')
    email = data.get('email')
    password = data.get('password')
    
    if not all([nombre, email, password]):
        return jsonify({"error": "Nombre, email y contraseña son requeridos"}), 400
    
    conn = get_db()
    
    cursor = conn.execute('SELECT id FROM usuario WHERE email = ?', (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"error": "El email ya está registrado"}), 400
    
    hashed_pwd = hash_password(password)
    cursor = conn.execute('''
        INSERT INTO usuario (nombre, email, hashed_password)
        VALUES (?, ?, ?)
    ''', (nombre, email, hashed_pwd))
    
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    token = create_token(email)
    return jsonify({"access_token": token, "token_type": "bearer"})

@app.route('/iniciar-sesion', methods=['POST'])
def iniciar_sesion():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Email y contraseña son requeridos"}), 400
    
    conn = get_db()
    cursor = conn.execute('SELECT * FROM usuario WHERE email = ?', (email,))
    user = cursor.fetchone()
    conn.close()
    
    if not user or not verify_password(password, user['hashed_password']):
        return jsonify({"error": "Credenciales inválidas"}), 401
    
    token = create_token(email)
    return jsonify({"access_token": token, "token_type": "bearer"})

@app.route('/carrito')
def get_carrito():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    conn = get_db()
    
    cursor = conn.execute('''
        SELECT id FROM carrito 
        WHERE usuario_id = ? AND estado = 'abierto'
    ''', (user['id'],))
    
    carrito = cursor.fetchone()
    if not carrito:
        cursor = conn.execute('''
            INSERT INTO carrito (usuario_id, estado)
            VALUES (?, 'abierto')
        ''', (user['id'],))
        carrito_id = cursor.lastrowid
        conn.commit()
    else:
        carrito_id = carrito['id']
    
    cursor = conn.execute('''
        SELECT ic.*, p.nombre, p.precio, p.imagen
        FROM itemcarrito ic
        JOIN producto p ON ic.producto_id = p.id
        WHERE ic.carrito_id = ?
    ''', (carrito_id,))
    
    items = []
    total = 0
    for row in cursor.fetchall():
        item = dict(row)
        subtotal = item['precio'] * item['cantidad']
        total += subtotal
        items.append({
            "id": item['id'],
            "producto_id": item['producto_id'],
            "nombre": item['nombre'],
            "precio": item['precio'],
            "cantidad": item['cantidad'],
            "subtotal": subtotal,
            "imagen": item['imagen']
        })
    
    conn.close()
    return jsonify({"items": items, "total": total})

@app.route('/carrito', methods=['POST'])
def agregar_carrito():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json()
    product_id = int(data.get('product_id'))
    cantidad = int(data.get('cantidad', 1))
    
    conn = get_db()
    
    cursor = conn.execute('SELECT * FROM producto WHERE id = ?', (product_id,))
    producto = cursor.fetchone()
    if not producto:
        conn.close()
        return jsonify({"error": "Producto no encontrado"}), 404
    
    if producto['existencia'] <= 0:
        conn.close()
        return jsonify({"error": "Producto agotado"}), 400
    
    cursor = conn.execute('''
        SELECT id FROM carrito 
        WHERE usuario_id = ? AND estado = 'abierto'
    ''', (user['id'],))
    
    carrito = cursor.fetchone()
    if not carrito:
        cursor = conn.execute('''
            INSERT INTO carrito (usuario_id, estado)
            VALUES (?, 'abierto')
        ''', (user['id'],))
        carrito_id = cursor.lastrowid
        conn.commit()
    else:
        carrito_id = carrito['id']
    
    cursor = conn.execute('''
        SELECT * FROM itemcarrito 
        WHERE carrito_id = ? AND producto_id = ?
    ''', (carrito_id, product_id))
    
    existing_item = cursor.fetchone()
    
    if existing_item:
        nueva_cantidad = existing_item['cantidad'] + cantidad
        if nueva_cantidad > producto['existencia']:
            conn.close()
            return jsonify({"error": "No hay suficiente stock"}), 400
        
        conn.execute('''
            UPDATE itemcarrito 
            SET cantidad = ? 
            WHERE id = ?
        ''', (nueva_cantidad, existing_item['id']))
    else:
        if cantidad > producto['existencia']:
            conn.close()
            return jsonify({"error": "No hay suficiente stock"}), 400
        
        conn.execute('''
            INSERT INTO itemcarrito (carrito_id, producto_id, cantidad)
            VALUES (?, ?, ?)
        ''', (carrito_id, product_id, cantidad))
    
    conn.commit()
    conn.close()
    return jsonify({"ok": True})

@app.route('/carrito/<int:product_id>', methods=['DELETE'])
def eliminar_carrito(product_id):
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    conn = get_db()
    
    cursor = conn.execute('''
        SELECT id FROM carrito 
        WHERE usuario_id = ? AND estado = 'abierto'
    ''', (user['id'],))
    
    carrito = cursor.fetchone()
    if not carrito:
        conn.close()
        return jsonify({"error": "Carrito no encontrado"}), 404
    
    cursor = conn.execute('''
        DELETE FROM itemcarrito 
        WHERE carrito_id = ? AND producto_id = ?
    ''', (carrito['id'], product_id))
    
    if cursor.rowcount == 0:
        conn.close()
        return jsonify({"error": "Item no encontrado"}), 404
    
    conn.commit()
    conn.close()
    return jsonify({"ok": True})

@app.route('/carrito/<int:product_id>', methods=['PUT'])
def actualizar_carrito(product_id):
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json()
    nueva_cantidad = int(data.get('cantidad', 1))
    
    if nueva_cantidad <= 0:
        return jsonify({"error": "Cantidad debe ser mayor a 0"}), 400
    
    conn = get_db()
    
    cursor = conn.execute('SELECT existencia FROM producto WHERE id = ?', (product_id,))
    producto = cursor.fetchone()
    if nueva_cantidad > producto['existencia']:
        conn.close()
        return jsonify({"error": "No hay suficiente stock"}), 400
    
    cursor = conn.execute('''
        UPDATE itemcarrito 
        SET cantidad = ? 
        WHERE producto_id = ? AND carrito_id IN (
            SELECT id FROM carrito WHERE usuario_id = ? AND estado = 'abierto'
        )
    ''', (nueva_cantidad, product_id, user['id']))
    
    conn.commit()
    conn.close()
    return jsonify({"ok": True})

if __name__ == '__main__':
    init_db()
    print("✅ Backend Flask iniciado en http://localhost:8000")
    app.run(host='0.0.0.0', port=8000, debug=True)