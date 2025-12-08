"""Archivo legacy mantenido para compatibilidad.

Toda la lógica de la API vive ahora en `backend/app/`.
Este archivo solo expone `app` importando desde `app.main` para no romper
scripts o referencias antiguas que usaban `python backend/main.py`.
"""

from app.main import app  # type: ignore F401

if __name__ == "__main__":  # Permite seguir ejecutando: python backend/main.py
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
