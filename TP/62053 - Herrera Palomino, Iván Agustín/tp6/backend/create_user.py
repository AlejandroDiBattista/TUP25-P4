from main import *
from sqlmodel import Session
import hashlib

# Crear usuario de prueba si no existe
def create_test_user():
    with Session(engine) as session:
        # Verificar si ya existe
        existing = session.exec(select(Usuario).where(Usuario.email == "test@test.com")).first()
        if existing:
            print("Usuario test@test.com ya existe")
            return
        
        # Crear nuevo usuario
        password = "123456"
        hashed = hashlib.sha256(password.encode()).hexdigest()
        user = Usuario(
            nombre="Usuario Test",
            email="test@test.com", 
            hashed_password=hashed
        )
        session.add(user)
        session.commit()
        print("✅ Usuario creado: test@test.com / 123456")

if __name__ == "__main__":
    create_test_user()