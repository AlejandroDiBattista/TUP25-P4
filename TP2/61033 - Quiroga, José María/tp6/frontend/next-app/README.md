# Frontend (Next.js + Tailwind)

Este es un esqueleto mínimo de frontend para consumir la API backend que está en `tp/.../tp6/backend`.

Pasos para arrancar (PowerShell en Windows):

1. Ir a la carpeta del frontend:

```powershell
cd "frontend\next-app"
```

2. Instalar dependencias:

```powershell
npm install
```

3. Ejecutar en modo desarrollo:

```powershell
npm run dev
```

4. Abrir http://localhost:3000

Notas:
- La app asume que tu backend corre en http://127.0.0.1:8001 (o ajustar variable NEXT_PUBLIC_API_URL).
- Si querés usar Shadcn UI podés seguir su guía e instalar las dependencias y componentes dentro de este proyecto.
