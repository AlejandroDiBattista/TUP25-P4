import os
from pathlib import Path

from dotenv import load_dotenv

from PIL import Image
import mimetypes

from google import genai
from google.genai import types

ImagenesSoportadas = { ".png", ".jpeg", ".jpg", ".bmp", ".gif", ".tiff", ".webp", ".heic", ".heif", }
TamañoPerfil = 1024

load_dotenv()  # Load variables defined in the nearest .env file


def recorrer(raiz: str, condicion= "*", extensiones=ImagenesSoportadas):
    """Devuelve archivos de imagen dentro de raiz de forma recursiva."""

    raiz_path = Path(raiz).expanduser().resolve()
    for entry in raiz_path.rglob(condicion):
        if entry.is_file() and entry.suffix.lower() in extensiones:
            yield entry


def convertir_imagen(origen: str, destino: str, tipo="JPEG", quality: int = 90) -> bool:
    origen_path  = Path(origen).expanduser().resolve()
    destino_path = Path(destino).expanduser().resolve()
    if origen_path != destino_path:
        try:
            with Image.open(origen_path) as img:
                rgb_img = img.convert("RGB")
                rgb_img.save(destino_path, tipo, quality=quality, optimize=True)
        except:
            return False
    return True

def redimensionar_imagen(origen: str, tamaño: int = TamañoPerfil) -> bool:
    """Redimensiona una imagen para que su dimensión más grande sea igual a max_dimension (arriba/abajo)."""

    origen_path = Path(origen).expanduser().resolve()
    
    try:
        with Image.open(origen_path) as img:
            width, height = img.size
            maximo = max(width, height)
            escala = tamaño / maximo
            img    = img.resize((int(width * escala), int(height * escala)), Image.Resampling.LANCZOS)
            img.save(origen_path, "JPEG", quality=90, optimize=True)
    except:
        return False
    return True    


def convertir_images(raiz: str, quality: int = 90, borrar: bool = False) -> dict:
    """Convierte todas las imágenes bajo `raiz` a JPEG, sobrescribiendo los archivos existentes."""

    convertidos, errores = 0, 0
    for origen_path in recorrer(raiz):
        destino_path = origen_path.with_suffix(".jpeg")
        
        if convertir_imagen(origen_path, destino_path, quality=quality):
            convertidos += 1
            if borrar:
                origen_path.unlink()
        else:
            errores += 1

    return {"convertidos": convertidos, "errores": errores}


def redimensionar_perfiles(raiz: str, tamaño: int = TamañoPerfil):
    """Redimensiona imágenes '0.jpeg' para que su dimensión más grande sea igual a tamaño (arriba/abajo)."""
    
    for origen_path in recorrer(raiz, "0.jpeg"):
        redimensionar_imagen(origen_path, tamaño)


def procesar_imagen(origen: str, destino: str, prompt: str = "", image_size: str = "1K" ) -> bool:
    """Procesa una imagen con la API de Google GenAI y guarda el resultado en destino."""

    if not prompt:
        prompt = """
            Genera una foto de perfil profesional tipo carnet con estas especificaciones:
            - Iluminación de estudio fotográfico profesional
            - Fondo neutro uniforme (gris claro)
            - Rostro centrado ocupando 60-70% del encuadre
            - Mantener cuerpo y ropa visibles (busto completo)
            - Preservar detalles faciales exactos
            - Remover auriculares si existen
            - Formato cuadrado optimizado (1:1)
            """
    
    origen_path  = Path(origen).expanduser().resolve()
    destino_path = Path(destino).expanduser().resolve()
    
    if not origen_path.exists() or destino_path.exists(): return False
    
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    modelo = "gemini-2.5-flash-image"
    image_bytes = origen_path.read_bytes()
    image_mime  = mimetypes.guess_type(origen_path.name)[0] or "image/jpeg"

    config = types.GenerateContentConfig(
        response_modalities=["IMAGE"],
        image_config=types.ImageConfig(image_size=image_size),
    )

    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=prompt.strip()),
                types.Part.from_bytes(data=image_bytes, mime_type=image_mime),
            ],
        )
    ]

    respuesta = client.models.generate_content(model=modelo, contents=contents, config=config)
    
    primero = respuesta.candidates[0] if respuesta.candidates else None
    if primero and primero.content and hasattr(primero.content, "parts"):
        for parte in primero.content.parts:
            inline = getattr(parte, "inline_data", None)
            if data := getattr(inline, "data", None):   
                destino_path.write_bytes(data)
                return True
    return False


def procesar_perfiles( raiz: str | Path, prompt: str = "", image_size: str = "1K" ) -> dict:
    """Aplica procesar_imagen a cada '0.jpeg' dentro de raiz."""

    procesados, errores = 0, 0
    for origen_path in recorrer(raiz,"0.jpeg"):
        destino_path = origen_path.with_name("00.jpeg")
        if procesar_imagen(origen=origen_path, destino=destino_path, prompt=prompt, image_size=image_size):
            procesados += 1
        else:
            errores += 1

    return {"procesados": procesados, "errores": errores}

def copiar_perfiles(raiz: str = "emails"):
    for origen in recorrer(raiz, "00.jpeg"):
        legajo = origen.parent.name
        
        for destino in Path("./tp").glob("*"):
            if destino.is_dir() and destino.name.startswith(legajo):
                destino_path = destino / f"{legajo}.jpeg"
                destino_path.write_bytes(origen.read_bytes())
                print(f"Copiado: {origen} -> {destino_path}")                   
                break
            
def eliminar_0jpeg(raiz: str = "emails"):    
    for origen in recorrer(raiz):
        if origen.name != "0.jpeg": continue
        
        perfil = origen.with_name("00.jpeg")
        if perfil.exists():
            origen.unlink()
            print(f"Eliminado: {origen}")

def copiar_pantallas(origen: str = "emails", destino: str = "tp") -> int:
    """Copia todos los .jpg de cada legajo hacia `tp/<legajo*/tp6/pantalla/`."""

    import shutil

    copiados = 0
    for origen_path in Path(origen).rglob("*.jpeg"):
        if origen_path.name.lower() == "00.jpeg":
            continue

        legajo = origen_path.parent.name
        if not legajo.isdigit():
            continue

        destino_base = None
        for candidato in Path(destino).glob("*"):
            if candidato.is_dir() and candidato.name.startswith(legajo):
                destino_base = candidato
                break
        if not destino_base:
            continue

        pantalla_dir = destino_base / "tp6" / "pantallas"
        pantalla_dir.mkdir(parents=True, exist_ok=True)

        destino_path = pantalla_dir / origen_path.name
        if destino_path.exists():
            continue
        destino_path.write_bytes(origen_path.read_bytes())
        copiados += 1
        print(f"Copiado {origen_path.name} → {destino_path}")

    return copiados
 

if __name__ == "__main__":
    raiz = Path("emails")
    # convertir_images(raiz, quality=90)
    # redimensionar_perfiles(raiz)
    # procesar_perfiles(raiz)
    # copiar_perfiles(raiz)
    # eliminar_0jpeg(raiz)
    copiar_pantallas(raiz)