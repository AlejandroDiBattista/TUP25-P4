Este directorio contiene un esqueleto para usar Alembic con SQLModel/SQLAlchemy.

Pasos recomendados para habilitar migraciones (local/prod):

1. Instalar alembic en tu entorno:

   pip install alembic

2. Inicializar alembic (creará una carpeta alembic y alembic.ini):

   alembic init alembic

3. Reemplazar el contenido de `alembic/env.py` por el template o ajustar para que importe
   los modelos de `app.models` y use `settings.DATABASE_URL`.

4. Crear la primera migración (autogenerada si configuras target_metadata):

   alembic revision --autogenerate -m "create initial tables"

5. Aplicar migraciones:

   alembic upgrade head

Archivo de ejemplo (template) `alembic/env.py` está incluido como referencia.
