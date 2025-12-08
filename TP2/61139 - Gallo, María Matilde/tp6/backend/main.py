from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import select
from typing import List, Optional
import json, os

from database import create_db_and_tables, get_session 
from sqlmodel import Session
from models import User, Product, Cart, CartItem, Purchase, PurchaseItem
from utils import hash_password, verify_password
from auth import create_token, current_user_id


app = FastAPI(title="TP6 - E-commerce API")

# CORS (Next.js en 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","http://127.0.0.1:3000"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

# Archivos estáticos (imagenes/)
BASE = os.path.dirname(__file__)
app.mount("/imagenes", StaticFiles(directory=os.path.join(BASE, "imagenes")), name="imagenes")

@app.on_event("startup")
def startup():
    create_db_and_tables()
    # seed productos
    session_generator = get_session()
    with next(session_generator) as s:
        if s.exec(select(Product)).first() is None:
            data_path = os.path.join(BASE, "productos.json")
            with open(data_path, "r", encoding="utf-8") as f:
                items = json.load(f)
            for p in items:
                s.add(Product(**p))  # usa 'titulo','precio',... como en tu JSON
            s.commit()

# ====== Schemas (rápidos)
from pydantic import BaseModel, EmailStr
class RegisterIn(BaseModel): nombre:str; email:EmailStr; password:str
class LoginIn(BaseModel): email:EmailStr; password:str
class TokenOut(BaseModel): access_token:str
class AddToCartIn(BaseModel): product_id:int; cantidad:int=1
class CheckoutIn(BaseModel): direccion:str; tarjeta:str

# ====== Auth
@app.post("/registrar", response_model=TokenOut, tags=["auth"])
def registrar(data: RegisterIn, s: Session = Depends(get_session)):
    if s.exec(select(User).where(User.email==data.email)).first():
        raise HTTPException(400, "Email ya registrado")
    u = User(nombre=data.nombre, email=data.email, password_hash=hash_password(data.password))
    s.add(u); s.commit(); s.refresh(u)
    # crear carrito abierto
    s.add(Cart(user_id=u.id, estado="abierto")); s.commit()
    return {"access_token": create_token(u.id)}

@app.post("/iniciar-sesion", response_model=TokenOut, tags=["auth"])
def login(data: LoginIn, s: Session = Depends(get_session)):
    u = s.exec(select(User).where(User.email==data.email)).first()
    if not u or not verify_password(data.password, u.password_hash):
        raise HTTPException(401, "Credenciales inválidas")
    return {"access_token": create_token(u.id)}

@app.post("/cerrar-sesion", tags=["auth"])
def logout():  # el frontend solo borra el token
    return {"ok": True}

# ====== Productos
@app.get("/productos", tags=["productos"])
def get_products(q: Optional[str]=None, categoria: Optional[str]=None, s: Session = Depends(get_session)):
    stmt = select(Product)
    if q:
        like = f"%{q.lower()}%"
        stmt = stmt.where((Product.titulo.ilike(like)) | (Product.descripcion.ilike(like)))
    if categoria:
        stmt = stmt.where(Product.categoria==categoria)
    return s.exec(stmt).all()

@app.get("/productos/{pid}", tags=["productos"])
def get_product(pid:int, s: Session = Depends(get_session)):
    p = s.get(Product, pid)
    if not p: raise HTTPException(404, "Producto no encontrado")
    return p

# ====== Carrito
def _carrito_abierto(s: Session, uid:int) -> Cart:
    cart = s.exec(select(Cart).where(Cart.user_id==uid, Cart.estado=="abierto")).first()
    if not cart:
        cart = Cart(user_id=uid, estado="abierto"); s.add(cart); s.commit(); s.refresh(cart)
    return cart

@app.get("/carrito", tags=["carrito"])
def ver_carrito(uid:int = Depends(current_user_id), s: Session = Depends(get_session)):
    cart = _carrito_abierto(s, uid)
    items = s.exec(select(CartItem).where(CartItem.cart_id==cart.id)).all()
    # expandir productos
    res = []
    for it in items:
        p = s.get(Product, it.product_id)
        res.append({"product_id":p.id,"titulo":p.titulo,"precio":p.precio,"imagen":p.imagen,"cantidad":it.cantidad})
    return {"cart_id": cart.id, "items": res}

@app.post("/carrito", tags=["carrito"])
def agregar(data: AddToCartIn, uid:int = Depends(current_user_id), s: Session = Depends(get_session)):
    p = s.get(Product, data.product_id)
    if not p: raise HTTPException(404, "Producto no existe")
    if p.existencia < data.cantidad: raise HTTPException(400, "Producto agotado")
    cart = _carrito_abierto(s, uid)
    it = s.exec(select(CartItem).where(CartItem.cart_id==cart.id, CartItem.product_id==p.id)).first()
    if it: it.cantidad += data.cantidad
    else: s.add(CartItem(cart_id=cart.id, product_id=p.id, cantidad=data.cantidad))
    p.existencia -= data.cantidad
    s.commit()
    return {"ok": True}

@app.delete("/carrito/{product_id}", tags=["carrito"])
def quitar(product_id:int, uid:int = Depends(current_user_id), s: Session = Depends(get_session)):
    cart = _carrito_abierto(s, uid)
    it = s.exec(select(CartItem).where(CartItem.cart_id==cart.id, CartItem.product_id==product_id)).first()
    if not it: raise HTTPException(404, "Item no está en carrito")
    # devolver stock
    p = s.get(Product, product_id); p.existencia += it.cantidad
    s.delete(it); s.commit()
    return {"ok": True}

@app.post("/carrito/cancelar", tags=["carrito"])
def cancelar(uid:int = Depends(current_user_id), s: Session = Depends(get_session)):
    cart = _carrito_abierto(s, uid)
    items = s.exec(select(CartItem).where(CartItem.cart_id==cart.id)).all()
    for it in items:
        p = s.get(Product, it.product_id); p.existencia += it.cantidad; s.delete(it)
    cart.estado = "cancelado"; s.commit()
    # abrir uno nuevo
    s.add(Cart(user_id=uid, estado="abierto")); s.commit()
    return {"ok": True}

# ====== Checkout / Compras
def _iva_for(product_name_or_cat:str) -> float:
    # 10% si categoría contiene 'Electrónica', si no 21%
    return 0.10 if "Electr" in product_name_or_cat else 0.21

@app.post("/carrito/finalizar", tags=["checkout"])
def finalizar(data: CheckoutIn, uid:int = Depends(current_user_id), s: Session = Depends(get_session)):
    cart = _carrito_abierto(s, uid)
    items = s.exec(select(CartItem).where(CartItem.cart_id==cart.id)).all()
    if not items: raise HTTPException(400, "Carrito vacío")
    subtotal = 0.0; iva_total = 0.0
    for it in items:
        p = s.get(Product, it.product_id)
        subtotal += p.precio * it.cantidad
        iva_total += p.precio * it.cantidad * _iva_for(p.categoria)

    envio = 0.0 if subtotal > 1000 else 50.0
    total = subtotal + iva_total + envio

    comp = Purchase(user_id=uid, direccion=data.direccion, tarjeta=data.tarjeta[-4:],
                    subtotal=subtotal, iva=iva_total, envio=envio, total=total)
    s.add(comp); s.commit(); s.refresh(comp)

    for it in items:
        p = s.get(Product, it.product_id)
        s.add(PurchaseItem(purchase_id=comp.id, product_id=p.id, nombre=p.titulo,
                           precio_unitario=p.precio, cantidad=int(it.cantidad)))
        s.delete(it)
    cart.estado = "finalizado"; s.commit()
    # abrir uno nuevo
    s.add(Cart(user_id=uid, estado="abierto")); s.commit()
    return {"compra_id": comp.id, "total": total}

@app.get("/compras", tags=["compras"])
def compras(uid:int = Depends(current_user_id), s: Session = Depends(get_session)):
    return s.exec(select(Purchase).where(Purchase.user_id==uid).order_by(Purchase.id.desc())).all()

@app.get("/compras/{pid}", tags=["compras"])
def compra_detalle(pid:int, uid:int = Depends(current_user_id), s: Session = Depends(get_session)):
    comp = s.get(Purchase, pid)
    if not comp or comp.user_id != uid: raise HTTPException(404, "No encontrada")
    items = s.exec(select(PurchaseItem).where(PurchaseItem.purchase_id==pid)).all()
    return {"compra": comp, "items": items}
