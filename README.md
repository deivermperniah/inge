# inge

Seguimiento de tareas por asignatura y trimestre para el trayecto activo: cada estudiante marca sus tareas como hechas y ve su progreso general, por materia y por trimestre.

## Stack

- Astro 7 en modo servidor (`@astrojs/node`).
- React 19 para las islas interactivas y Tailwind CSS 4 con shadcn/ui.
- Supabase (Postgres + RLS, auth) con `@supabase/ssr`.
- Gestor de paquetes: pnpm (Node >= 22.12).

## Estructura

```text
src/
├── pages/              # Rutas: index, login, register, logout
│   └── api/            # Endpoints POST (tasks, subjects)
├── layouts/            # AppLayout.astro
├── components/
│   ├── ui/             # Componentes de shadcn
│   ├── admin/          # Modales de administración
│   └── header/         # Acciones del header (isla React)
├── lib/                # Cliente de Supabase, tema y utilidades
├── data/               # Datos estáticos (schedule.ts)
└── styles/global.css   # Tokens del tema
supabase/
├── migrations/         # Esquema y políticas RLS
└── seed.sql            # Datos iniciales
```

## Puesta en marcha

1. Instala dependencias:

   ```sh
   pnpm install
   ```

2. Crea `.env` con las credenciales de tu proyecto Supabase:

   ```sh
   PUBLIC_SUPABASE_URL=https://<proyecto>.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=<anon key>
   ```

3. En el editor SQL de Supabase, ejecuta en orden las migraciones de `supabase/migrations/` y luego `supabase/seed.sql`.

4. Inicia el servidor de desarrollo en `http://localhost:4321`:

   ```sh
   pnpm dev
   ```

## Comandos

| Comando | Acción |
| :-- | :-- |
| `pnpm dev` | Servidor de desarrollo en `localhost:4321` |
| `pnpm build` | Build de producción en `./dist/` |
| `pnpm preview` | Sirve el build localmente |
| `pnpm exec shadcn add <componente>` | Agrega un componente de shadcn a `src/components/ui/` |
