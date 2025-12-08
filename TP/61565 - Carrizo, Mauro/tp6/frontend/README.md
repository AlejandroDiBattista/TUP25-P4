# Frontend - E-commerce

Aplicación web desarrollada con Next.js 14, React, Tailwind CSS y Shadcn UI.

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno (opcional):
Crear archivo `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. Ejecutar en modo desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Scripts Disponibles

- `npm run dev`: Ejecutar en modo desarrollo
- `npm run build`: Construir para producción
- `npm run start`: Ejecutar versión de producción
- `npm run lint`: Ejecutar linter

## Estructura

- `app/`: Páginas y rutas de Next.js
  - `page.tsx`: Página principal (listado de productos)
  - `login/`: Página de autenticación
  - `carrito/`: Página del carrito
  - `checkout/`: Página de finalización de compra
  - `compras/`: Páginas de historial de compras
- `components/`: Componentes reutilizables
  - `ui/`: Componentes de Shadcn UI
- `lib/`: Utilidades y configuraciones
  - `api.ts`: Cliente Axios configurado
  - `auth-context.tsx`: Contexto de autenticación
  - `utils.ts`: Utilidades generales

## Tecnologías

- **Next.js 14**: Framework React con App Router
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilos utilitarios
- **Shadcn UI**: Componentes UI
- **Axios**: Cliente HTTP
- **Lucide React**: Iconos

