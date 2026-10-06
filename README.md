# inge

Seguimiento de tareas por asignatura y trimestre para el trayecto activo. Cada estudiante marca sus tareas como hechas y ve su progreso general, por materia y por trimestre.

## Funcionalidades

- **Cuentas**: registro e inicio de sesión con correo y contraseña (Supabase Auth).
- **Inicio**: asignaturas del trayecto activo con su progreso. Cada trimestre muestra su estado: sin tareas, pendiente, en progreso o completo.
- **Tareas**: se marcan y desmarcan al instante. Si el servidor falla, el cambio se revierte.
- **Mis materias**: cada usuario puede ocultar materias solo para sí mismo.
- **Horario y docentes**: tabla de docentes por trimestre, coloreada según el progreso.
- **Tema**: claro, oscuro o el del sistema.
- **Administración** (rol `admin`): visibilidad global de las asignaturas. Se maneja desde un modal en el header.

## Stack

| Área | Tecnología |
| :--- | :--- |
| Framework | [Astro 7](https://docs.astro.build) en modo servidor (`@astrojs/node`) |
| UI | Tailwind CSS 4, componentes [shadcn/ui](https://ui.shadcn.com) sobre Base UI, React para las partes interactivas |
| Íconos | [Hugeicons](https://hugeicons.com) |
| Datos y auth | [Supabase](https://supabase.com) (Postgres + RLS) |

## Puesta en marcha

Requisitos: Node.js 22.12 o superior y pnpm.

1. Instala las dependencias:

   ```sh
   pnpm install
   ```

2. Crea un `.env` en la raíz con las credenciales de tu proyecto de Supabase:

   ```sh
   PUBLIC_SUPABASE_URL=https://<proyecto>.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=<anon key>
   ```

3. En el editor SQL de Supabase, ejecuta en orden las migraciones de `supabase/migrations/` y luego `supabase/seed.sql`. El seed carga el trayecto 2026 (III) con sus materias y tareas.

4. Levanta el servidor de desarrollo en `http://localhost:4321`:

   ```sh
   pnpm dev
   ```

### Dar rol de administrador

Todo usuario nuevo se crea con rol `user`. Para hacer admin a alguien, ejecuta esto en el editor SQL:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'correo@ejemplo.com');
```

## Comandos

| Comando | Acción |
| :--- | :--- |
| `pnpm dev` | Servidor de desarrollo en `localhost:4321` |
| `pnpm build` | Build de producción en `./dist/` |
| `pnpm preview` | Sirve el build localmente |
| `pnpm astro ...` | CLI de Astro (`astro add`, `astro check`, …) |
| `pnpm exec shadcn add <componente>` | Agrega un componente de shadcn a `src/components/ui/` |

## Estructura

```text
src/
├── components/
│   ├── admin/          # Modales de administración
│   ├── header/         # Acciones del header (isla React)
│   ├── ui/             # Componentes de shadcn
│   ├── Header.astro
│   ├── Icon.astro      # Hugeicons renderizados en el servidor
│   ├── Modal.astro     # Envoltorio común para <dialog>
│   ├── Switch.astro
│   └── ...             # Modales de materias y horario
├── data/schedule.ts    # Docentes por asignatura y trimestre
├── layouts/AppLayout.astro
├── lib/                # Cliente de Supabase, tema y utilidades
├── pages/
│   ├── api/            # Endpoints (ver abajo)
│   ├── index.astro     # Inicio
│   ├── login.astro
│   ├── register.astro
│   └── logout.astro
└── styles/global.css   # Tokens del tema (colores, radios, estados)
supabase/
├── migrations/         # Esquema y políticas RLS
└── seed.sql            # Datos iniciales
```

### Modelo de datos

| Tabla | Contenido |
| :--- | :--- |
| `profiles` | Rol de cada usuario (`user` o `admin`); se crea automáticamente al registrarse |
| `trayectos` | Año, nombre y cuál está activo |
| `subjects` | Asignaturas del trayecto, con `hidden` para ocultarlas a todos |
| `tasks` | Tareas de cada asignatura, con su trimestre (1 a 3) |
| `task_progress` | Qué tareas marcó cada usuario |
| `hidden_subjects` | Materias que cada usuario ocultó para sí mismo |

Las políticas RLS restringen cada usuario a sus propios datos. Solo los admins pueden modificar trayectos, asignaturas y tareas.

### API

Todos los endpoints reciben JSON por `POST` y requieren sesión.

| Endpoint | Cuerpo | Uso |
| :--- | :--- | :--- |
| `/api/tasks/toggle` | `{ task_id, done }` | Marca o desmarca una tarea |
| `/api/subjects/personal-toggle` | `{ subject_id, hidden }` | Oculta una materia para el usuario actual |
| `/api/subjects/toggle` | `{ subject_id, hidden }` | Oculta una materia para todos (solo admin) |

## Convenciones de UI

- **Colores**: usa los tokens del tema (`bg-card`, `text-muted-foreground`, `bg-primary`, `bg-success`, …) en vez de colores fijos, así funcionan en claro y oscuro. Están definidos en `src/styles/global.css`.
- **Componentes**: antes de escribir markup a mano, busca si ya existe uno en `src/components/ui/` o agrégalo con el CLI de shadcn.
- **Íconos**: Hugeicons; usa `Icon.astro` en archivos `.astro` y `HugeiconsIcon` en `.tsx`.
- **Funciones nuevas** (sobre todo las de administración): ábrelas en modales con `Modal.astro`, no en páginas aparte.
- **Estado interactivo**: el JS solo cambia atributos (`aria-checked`, `aria-pressed`, `data-*`) y Tailwind aplica los estilos con variantes como `aria-checked:` o `group-data-[hidden=true]:`.

## Contribuir

Commits en español con formato [Conventional Commits](https://www.conventionalcommits.org/es/), por ejemplo `feat(admin): mueve la visibilidad de asignaturas a un modal`. Cada commit debe agrupar solo cambios relacionados. Más reglas en [AGENTS.md](AGENTS.md).
