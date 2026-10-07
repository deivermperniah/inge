## Reglas de comportamiento (obligatorias)

- Haz SOLO el cambio mínimo necesario para resolver lo que se pide. Nada de "mientras estaba aquí, también...".
- No generes código, componentes, archivos ni carpetas que no se hayan pedido, salvo que sean indispensables para el cambio.
- No refactorices, reorganices ni "mejores" código que no forme parte de la tarea.
- No modifiques estilos, layout ni estructura visual si no se pidió.
- No agregues comentarios ni documentación dentro del código salvo que se pida.
- Si hay dudas sobre el alcance, pregunta antes de tocar código adicional.
- No repitas código: antes de crear algo, busca si ya existe en `src/components/ui/` o `src/lib/` y reutilízalo.
- Nada de lógica compleja: prefiere la solución más simple que funcione.

## Stack

- Astro 7 en modo servidor (`@astrojs/node`).
- React 19 solo para las partes interactivas (islas).
- Tailwind CSS 4 (tema en `src/styles/global.css`).
- Componentes shadcn/ui sobre Base UI (config en `components.json`).
- Supabase (Postgres + RLS, auth) con `@supabase/ssr`.
- Iconos Hugeicons (`@hugeicons/core-free-icons`, `@hugeicons/react`).
- Gestor de paquetes: pnpm (Node >= 22.12).

## Estructura

- `src/pages/`: una página `.astro` por ruta (`index`, `login`, `register`, `logout`). Deben ser finas: layout + contenido o una isla.
- `src/pages/api/`: endpoints `POST` que requieren sesión (`tasks/toggle`, `subjects/toggle`, `subjects/personal-toggle`).
- `src/layouts/`: `AppLayout.astro`.
- `src/components/ui/`: componentes de shadcn.
- `src/components/admin/`, `src/components/header/`: islas y secciones por tema.
- `src/components/`: componentes `.astro` compartidos (Header, Icon, Modal, Switch, modales de materias y horario).
- `src/lib/`: cliente de Supabase, tema y utilidades.
- `src/data/`: datos estáticos (`schedule.ts`).
- `src/styles/global.css`: tokens del tema.
- `supabase/`: `migrations/` (esquema y RLS) y `seed.sql`.

## Convenciones

- Las consultas a Supabase van solo en `src/lib/` y en los endpoints de `src/pages/api/`, nunca directamente en los componentes.
- Funciones nuevas (sobre todo las de administración) se abren en modales con `Modal.astro`, no en páginas aparte.
- Colores con los tokens del tema (`bg-card`, `text-muted-foreground`, `bg-primary`, `bg-success`, …), no con colores fijos, para que funcionen en claro y oscuro.
- Antes de escribir markup a mano, busca un componente existente en `src/components/ui/` o agrégalo con el CLI de shadcn.
- Iconos: `Icon.astro` en archivos `.astro` y `HugeiconsIcon` en `.tsx`.
- El estado interactivo se maneja cambiando atributos (`aria-checked`, `aria-pressed`, `data-*`) y Tailwind aplica los estilos con variantes (`aria-checked:`, `group-data-[hidden=true]:`).
- Endpoints: todos reciben JSON por `POST` y requieren sesión.
- Variables de entorno con prefijo `PUBLIC_` (`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`).
- Textos de la interfaz en español; código (nombres, variables) en inglés.

## Fuera de alcance por ahora

No agregar linters, tests ni funcionalidades fuera de las descritas en el README salvo que se pida explícitamente.

## Verificación

- Antes de cada commit: `pnpm build` sin errores.
- Si el cambio es visual o interactivo, comprobarlo en el navegador.
- No escribir datos de prueba en Supabase.

## Git y commits

- Commits pequeños, uno por cambio, solo cuando el usuario lo pida.
- Nunca hacer push, crear ramas ni reescribir el historial sin que se pida.
- Commits en español con formato [Conventional Commits](https://www.conventionalcommits.org/es/).
- Formato: `<tipo>(<ámbito opcional>): <descripción breve, imperativo>`, p. ej. `feat(admin): mueve la visibilidad de asignaturas a un modal`.
- Tipos permitidos: feat, fix, style, refactor, chore, docs.
- No mezclar archivos: cada commit agrupa solo cambios relacionados.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
