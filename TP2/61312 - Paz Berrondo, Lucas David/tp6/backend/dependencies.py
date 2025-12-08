"""
Dependencias de FastAPI para autenticación y autorización.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
from database import engine
from models import Usuario
from auth import verificar_token

# Esquema OAuth2 para obtener el token del header Authorization
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="iniciar-sesion")


def get_current_user(token: str = Depends(oauth2_scheme)) -> Usuario:
    """
    Obtener el usuario actual basado en el token JWT.
    
    Esta función es una dependencia de FastAPI que:
    1. Extrae el token del header Authorization
    2. Verifica y decodifica el token
    3. Busca el usuario en la base de datos
    4. Retorna el usuario o lanza una excepción 401
    
    Args:
        token: Token JWT del header Authorization (inyectado automáticamente)
        
    Returns:
        Usuario autenticado
        
    Raises:
        HTTPException 401: Si el token es inválido o el usuario no existe
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Verificar y decodificar el token
    email = verificar_token(token)
    if email is None:
        raise credentials_exception
    
    # Buscar el usuario en la base de datos
    with Session(engine) as session:
        statement = select(Usuario).where(Usuario.email == email)
        usuario = session.exec(statement).first()
        
        if usuario is None:
            raise credentials_exception
        
        return usuario


def get_current_active_user(current_user: Usuario = Depends(get_current_user)) -> Usuario:
    """
    Obtener el usuario actual y verificar que esté activo.
    
    Esta es una dependencia opcional para futura expansión.
    Por ahora, simplemente retorna el usuario actual.
    
    Args:
        current_user: Usuario actual (inyectado por get_current_user)
        
    Returns:
        Usuario activo
        
    Raises:
        HTTPException 400: Si el usuario está inactivo (no implementado aún)
    """
    # En el futuro se podría agregar un campo "activo" al modelo Usuario
    # if not current_user.activo:
    #     raise HTTPException(status_code=400, detail="Usuario inactivo")
    return current_user
