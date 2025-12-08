#!/usr/bin/env python3
"""
Script para ejecutar todas las pruebas de la API E-Commerce
"""

import subprocess
import sys
from pathlib import Path

def run_tests():
    """Ejecutar todas las pruebas"""
    print("🧪 Ejecutando pruebas de la API E-Commerce...")
    print("=" * 60)
    
    try:
        # Instalar pytest si no está disponible
        try:
            import pytest
        except ImportError:
            print("📦 Instalando pytest...")
            subprocess.run([sys.executable, "-m", "pip", "install", "pytest", "httpx"], check=True)
        
        # Ejecutar las pruebas
        result = subprocess.run([
            sys.executable, "-m", "pytest", 
            "test_api.py", 
            "-v", 
            "--tb=short",
            "--color=yes"
        ], capture_output=True, text=True)
        
        print(result.stdout)
        if result.stderr:
            print("Warnings/Errors:")
            print(result.stderr)
        
        if result.returncode == 0:
            print("\n✅ ¡Todas las pruebas pasaron exitosamente!")
        else:
            print(f"\n❌ Algunas pruebas fallaron (código: {result.returncode})")
            
        return result.returncode == 0
        
    except Exception as e:
        print(f"❌ Error ejecutando las pruebas: {e}")
        return False

def check_coverage():
    """Verificar cobertura de código (opcional)"""
    try:
        import coverage
        print("\n📊 Ejecutando análisis de cobertura...")
        
        # Ejecutar con cobertura
        subprocess.run([
            sys.executable, "-m", "coverage", "run", 
            "-m", "pytest", "test_api.py"
        ], check=True)
        
        # Generar reporte
        result = subprocess.run([
            sys.executable, "-m", "coverage", "report", 
            "--show-missing"
        ], capture_output=True, text=True)
        
        print(result.stdout)
        
    except ImportError:
        print("📋 Coverage no disponible. Para instalar: pip install coverage")
    except Exception as e:
        print(f"❌ Error en análisis de cobertura: {e}")

if __name__ == "__main__":
    print("🚀 E-Commerce API Test Runner")
    print("=" * 60)
    
    # Verificar que estamos en el directorio correcto
    if not Path("main.py").exists():
        print("❌ Error: Ejecutar desde el directorio backend/")
        sys.exit(1)
    
    # Ejecutar pruebas
    success = run_tests()
    
    # Opcional: verificar cobertura
    if success and "--coverage" in sys.argv:
        check_coverage()
    
    # Salir con código apropiado
    sys.exit(0 if success else 1)