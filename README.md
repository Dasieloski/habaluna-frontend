# Habanaluna Frontend

Frontend desarrollado con Next.js 14 para el ecommerce Habanaluna.

## Características

- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **TailwindCSS** - Estilos utility-first
- **shadcn/ui** - Componentes UI reutilizables
- **Zustand** - Gestión de estado
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas

## Instalación

```bash
npm install
```

## Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# La aplicación estará disponible en http://localhost:3000
```

## Build

```bash
# Crear build de producción
npm run build

# Iniciar servidor de producción
npm run start
```

## Estructura

```
app/
├── (main)/        # Rutas principales con layout
│   ├── products/  # Páginas de productos
│   ├── cart/      # Página de carrito
│   ├── checkout/  # Página de checkout
│   ├── auth/      # Páginas de autenticación
│   ├── profile/   # Página de perfil
│   └── admin/     # Panel de administración
├── components/    # Componentes reutilizables
│   ├── ui/        # Componentes UI base
│   └── layout/    # Componentes de layout
└── lib/           # Utilidades y configuraciones
    ├── api.ts     # Cliente API
    └── store/     # Stores de Zustand
```

## Variables de Entorno

Crea un archivo `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

