"""Utilidades para autenticación y manejo de usuarios"""

from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, status
from sqlmodel import Session, select
import bcrypt
import re

from models import Usuario, UsuarioCreate, UsuarioResponse

def validar_email(email: str) -> bool:
    """Validar formato de email"""
    patron = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(patron, email) is not None

def validar_contraseña(contraseña: str) -> dict:
    """Validar fuerza de contraseña y retornar resultado"""
    errores = []
    
    if len(contraseña) < 6:
        errores.append("La contraseña debe tener al menos 6 caracteres")
    
    if len(contraseña) > 50:
        errores.append("La contraseña no puede tener más de 50 caracteres")
    
    if not re.search(r'[A-Za-z]', contraseña):
        errores.append("La contraseña debe contener al menos una letra")
    
    if not re.search(r'[0-9]', contraseña):
        errores.append("La contraseña debe contener al menos un número")
    
    return {
        "valida": len(errores) == 0,
        "errores": errores
    }

def verificar_usuario_existente(session: Session, email: str) -> bool:
    """Verificar si un usuario ya existe con el email dado"""
    statement = select(Usuario).where(Usuario.email == email)
    usuario_existente = session.exec(statement).first()
    return usuario_existente is not None

def crear_usuario(session: Session, usuario_data: UsuarioCreate) -> Usuario:
    """Crear un nuevo usuario en la base de datos"""
    
    # Validar email
    if not validar_email(usuario_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato de email inválido"
        )
    
    # Validar contraseña
    validacion = validar_contraseña(usuario_data.contraseña)
    if not validacion["valida"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "mensaje": "Contraseña no válida",
                "errores": validacion["errores"]
            }
        )
    
    # Verificar si el usuario ya existe
    if verificar_usuario_existente(session, usuario_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un usuario con este email"
        )
    
    # Hash de la contraseña
    contraseña_hash = Usuario.hash_contraseña(usuario_data.contraseña)
    
    # Crear usuario
    usuario = Usuario(
        nombre=usuario_data.nombre.strip(),
        email=usuario_data.email.lower().strip(),
        contraseña_hash=contraseña_hash,
        fecha_registro=datetime.now()
    )
    
    session.add(usuario)
    session.commit()
    session.refresh(usuario)
    
    return usuario

def autenticar_usuario(session: Session, email: str, contraseña: str) -> Optional[Usuario]:
    """Autenticar usuario por email y contraseña"""
    statement = select(Usuario).where(Usuario.email == email.lower().strip())
    usuario = session.exec(statement).first()
    
    if not usuario:
        return None
    
    if not usuario.verificar_contraseña(contraseña):
        return None
    
    return usuario

def obtener_usuario_por_id(session: Session, usuario_id: int) -> Optional[Usuario]:
    """Obtener usuario por ID"""
    statement = select(Usuario).where(Usuario.id == usuario_id)
    return session.exec(statement).first()

def convertir_a_usuario_response(usuario: Usuario) -> UsuarioResponse:
    """Convertir Usuario a UsuarioResponse (sin contraseña)"""
    return UsuarioResponse(
        id=usuario.id,
        nombre=usuario.nombre,
        email=usuario.email,
        fecha_registro=usuario.fecha_registro
    )