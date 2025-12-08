from pathlib import Path
from typing import Iterable

from PIL import Image
from rembg import remove


SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
MAX_DIMENSION = 512
TOP_MARGIN = 48


def normalizar_imagen(origen: Path, destino: Path, max_dimension: int = MAX_DIMENSION) -> Path:
    """
    Procesa una imagen: limita tamaño máximo, quita fondo, centra en lienzo 1:1 con fondo blanco
    y guarda el resultado.
    """
    with Image.open(origen) as img:
        img = img.convert("RGBA")
        img = remove(img)
        img = img.convert("RGBA")

        # Escalar para que quepa en un lienzo cuadrado max_dimension con margen superior
        available_h = max_dimension - TOP_MARGIN
        scale = min(available_h / img.height, max_dimension / img.width, 1.0)
        new_size = (
            max(1, int(round(img.width * scale))),
            max(1, int(round(img.height * scale))),
        )
        img = img.resize(new_size, Image.LANCZOS)

        lienzo = Image.new("RGBA", (max_dimension, max_dimension), (255, 255, 255, 0))
        x_offset = (lienzo.width - img.width) // 2
        y_offset = lienzo.height - img.height  # sin margen inferior
        lienzo.paste(img, (x_offset, y_offset), img)

        destino.parent.mkdir(parents=True, exist_ok=True)
        lienzo.save(destino, format="PNG")
    return destino


def procesar_carpeta(origen: Path = Path("./deploy/perfil"), destino: Path = Path("./deploy/nuevo"), max_dimension: int = MAX_DIMENSION) -> list[Path]:
    procesadas: list[Path] = []
    origen = origen.expanduser().resolve()
    destino = destino.expanduser().resolve()

    if not origen.exists() or not origen.is_dir():
        raise FileNotFoundError(f"Directorio de origen no encontrado: {origen}")

    for ruta in _iterar_imagenes(origen):
        try:
            salida = destino / f"{ruta.stem}.png"
            normalizar_imagen(ruta, salida, max_dimension=max_dimension)
            procesadas.append(salida)
        except Exception as exc:  # noqa: BLE001
            print(f"[WARN] No se pudo procesar {ruta.name}: {exc}")

    print(f"Listo: {len(procesadas)} imágenes guardadas en {destino}")
    return procesadas


def _iterar_imagenes(origen: Path) -> Iterable[Path]:
    for archivo in sorted(origen.iterdir()):
        if archivo.is_file() and archivo.suffix.lower() in SUPPORTED_EXTENSIONS:
            yield archivo


if __name__ == "__main__":
    procesar_carpeta()
