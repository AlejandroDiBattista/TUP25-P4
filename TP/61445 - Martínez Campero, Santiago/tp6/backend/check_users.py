from database import engine
from sqlmodel import Session, select
from models import Usuario

session = Session(engine)
usuarios = session.exec(select(Usuario)).all()
print(f"\nUsuarios en la base de datos: {len(usuarios)}\n")
for u in usuarios:
    print(f"ID: {u.id}, Email: {u.email}, Nombre: {u.nombre}")
session.close()
