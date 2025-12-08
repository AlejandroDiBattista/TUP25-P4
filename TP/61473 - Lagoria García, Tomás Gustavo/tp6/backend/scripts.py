"""
Scripts de gestión del proyecto - Similar a npm scripts
Uso: uv run python scripts.py <comando>
"""
import sys
import subprocess
import os
from pathlib import Path

def run_command(cmd: str, description: str):
    """Ejecuta un comando del sistema"""
    print(f"\n{'='*60}")
    print(f"  {description}")
    print(f"{'='*60}\n")
    result = subprocess.run(cmd, shell=True)
    return result.returncode

def init_db():
    """Inicializa la base de datos"""
    return run_command(
        "python init_db.py",
        "INICIALIZANDO BASE DE DATOS"
    )

def dev():
    """Inicia el servidor en modo desarrollo"""
    return run_command(
        "uvicorn main:app --reload",
        "INICIANDO SERVIDOR EN MODO DESARROLLO"
    )

def start():
    """Inicia el servidor en modo producción"""
    return run_command(
        "uvicorn main:app",
        "INICIANDO SERVIDOR EN MODO PRODUCCIÓN"
    )

def test():
    """Ejecuta los tests"""
    return run_command(
        "pytest -v",
        "EJECUTANDO TESTS"
    )

def reset_db():
    """Elimina y recrea la base de datos"""
    db_file = Path("ecommerce.db")
    if db_file.exists():
        print(f"\n[!] Se eliminará la base de datos existente")
        confirm = input("¿Estás seguro? (s/N): ")
        if confirm.lower() != 's':
            print("[X] Operación cancelada")
            return 0
        db_file.unlink()
        print("[OK] Base de datos eliminada")
    return init_db()

def show_help():
    """Muestra la ayuda de comandos disponibles"""
    print("""
╔══════════════════════════════════════════════════════════════╗
║           Scripts Backend - E-Commerce TP6                   ║
║              (similar a npm run scripts)                     ║
╚══════════════════════════════════════════════════════════════╝

Uso: uv run python scripts.py <comando>

Comandos disponibles:

  dev           Inicia el servidor en modo desarrollo (hot-reload)
                → uvicorn main:app --reload
                
  start         Inicia el servidor en modo producción
                → uvicorn main:app
                
  init-db       Inicializa la base de datos con productos
                → python init_db.py
                
  reset-db      Elimina y recrea la base de datos
                → rm ecommerce.db && python init_db.py
                
  test          Ejecuta los tests con pytest
                → pytest -v
                
  help          Muestra esta ayuda

Ejemplos:
  uv run python scripts.py dev        # Modo desarrollo
  uv run python scripts.py init-db    # Crear base de datos
  uv run python scripts.py test       # Ejecutar tests
  
URLs del servidor:
  API:  http://localhost:8000
  Docs: http://localhost:8000/docs
""")
    return 0

# Mapeo de comandos
COMMANDS = {
    'dev': dev,
    'start': start,
    'init-db': init_db,
    'reset-db': reset_db,
    'test': test,
    'help': show_help,
}

def main():
    """Punto de entrada principal"""
    if len(sys.argv) < 2:
        print("[ERROR] Debes especificar un comando")
        show_help()
        return 1
    
    command = sys.argv[1]
    
    if command not in COMMANDS:
        print(f"[ERROR] Comando desconocido: {command}")
        show_help()
        return 1
    
    return COMMANDS[command]()

if __name__ == "__main__":
    sys.exit(main())
